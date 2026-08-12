console.log("SCRIPT IS LOADING");

const dataInput = document.getElementById("dataInput");
const calculateBtn = document.getElementById("calculateBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const errorMessage = document.getElementById("errorMessage");

const canvas = document.getElementById("dataChart");
const ctx = canvas.getContext("2d");
const boxPlotCanvas =
    document.getElementById("boxPlotChart");

let boxPlotCtx = null;

if (boxPlotCanvas) {
    boxPlotCtx =
        boxPlotCanvas.getContext("2d");
}

const regressionCanvas =
    document.getElementById("regressionChart");

let regressionCtx = null;

if (regressionCanvas) {
    regressionCtx = regressionCanvas.getContext("2d");
}
function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "—";
    }

    return Number(number.toFixed(4)).toString();
}
function getData() {

    const input = dataInput.value.trim();

    if (!input) {
        throw new Error("Please enter some numbers.");
    }

    const values = input
        .split(/[\s,]+/)
        .map(Number);

    if (values.some(value => Number.isNaN(value))) {
        throw new Error(
            "Invalid data. Please enter numbers only."
        );
    }

    if (values.length < 2) {
        throw new Error(
            "Please enter at least two numbers."
        );
    }

    return values;
}


/* =========================
   MEAN
========================= */

function calculateMean(data) {

    return data.reduce(
        (sum, value) => sum + value,
        0
    ) / data.length;
}


/* =========================
   MEDIAN
========================= */

function calculateMedian(data) {

    const sorted = [...data].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (
            sorted[middle - 1] +
            sorted[middle]
        ) / 2;

    } else {

        return sorted[middle];

    }
}


/* =========================
   MODE
========================= */

function calculateMode(data) {

    const frequency = {};

    data.forEach(value => {

        frequency[value] =
            (frequency[value] || 0) + 1;

    });

    const maxFrequency =
        Math.max(...Object.values(frequency));

    if (maxFrequency === 1) {
        return "No mode";
    }

    return Object.keys(frequency)
        .filter(value =>
            frequency[value] === maxFrequency
        )
        .join(", ");
}


/* =========================
   QUARTILES
========================= */

function calculateQuartiles(data) {

    const sorted = [...data].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    let lowerHalf;
    let upperHalf;

    if (sorted.length % 2 === 0) {

        lowerHalf = sorted.slice(0, middle);
        upperHalf = sorted.slice(middle);

    } else {

        lowerHalf = sorted.slice(0, middle);
        upperHalf = sorted.slice(middle + 1);

    }

    const q1 = calculateMedian(lowerHalf);
    const q3 = calculateMedian(upperHalf);

    return {
        q1,
        q3,
        iqr: q3 - q1
    };
}


/* =========================
   VARIANCE + SD
========================= */

function calculateVariance(data, type) {

    const mean = calculateMean(data);

    const squaredDifferences = data.map(
        value => Math.pow(value - mean, 2)
    );

    const divisor =
        type === "sample"
            ? data.length - 1
            : data.length;

    return squaredDifferences.reduce(
        (sum, value) => sum + value,
        0
    ) / divisor;
}


/* =========================
   MAIN CALCULATION
========================= */

function calculateStatistics() {

    try {

        const data = getData();

        const sorted = [...data]
            .sort((a, b) => a - b);

        const type =
            document.querySelector(
                'input[name="dataType"]:checked'
            ).value;

        const mean = calculateMean(data);

        const median = calculateMedian(data);

        const mode = calculateMode(data);

        const minimum = Math.min(...data);

        const maximum = Math.max(...data);

        const range = maximum - minimum;

        const variance =
            calculateVariance(data, type);

        const standardDeviation =
            Math.sqrt(variance);

        const coefficientVariation =
            mean !== 0
                ? (standardDeviation / Math.abs(mean)) * 100
                : NaN;

        const standardError =
            standardDeviation /
            Math.sqrt(data.length);

        const quartiles =
            calculateQuartiles(data);


        /* =========================
           DISPLAY RESULTS
        ========================= */

        document.getElementById("sampleSize")
            .textContent = `n = ${data.length}`;

        document.getElementById("mean")
            .textContent = formatNumber(mean);

        document.getElementById("median")
            .textContent = formatNumber(median);

        document.getElementById("mode")
            .textContent = mode;

        document.getElementById("minimum")
            .textContent = formatNumber(minimum);

        document.getElementById("maximum")
            .textContent = formatNumber(maximum);

        document.getElementById("range")
            .textContent = formatNumber(range);

        document.getElementById("variance")
            .textContent = formatNumber(variance);

        document.getElementById("varianceType")
            .textContent =
                type === "sample"
                    ? "Sample"
                    : "Population";

        document.getElementById("standardDeviation")
            .textContent =
                formatNumber(standardDeviation);

        document.getElementById("coefficientVariation")
            .textContent =
                Number.isFinite(coefficientVariation)
                    ? `${coefficientVariation.toFixed(2)}%`
                    : "—";

        document.getElementById("standardError")
            .textContent =
                formatNumber(standardError);

        document.getElementById("q1")
            .textContent =
                formatNumber(quartiles.q1);

        document.getElementById("q3")
            .textContent =
                formatNumber(quartiles.q3);

        document.getElementById("iqr")
            .textContent =
                formatNumber(quartiles.iqr);


        /* =========================
           REMOVE ERROR
        ========================= */

        errorMessage.style.display = "none";

        /* =========================
           DRAW CHART
        ========================= */

        drawChart(sorted);

createFrequencyTable(data);

drawBoxPlot(data);

} catch (error) {

    errorMessage.textContent =
        "⚠️ " + error.message;

    errorMessage.style.display = "block";

}
}



/* =========================
   CLEAR
========================= */

function clearCalculator() {

    dataInput.value = "";

    const ids = [
        "sampleSize",
        "mean",
        "median",
        "mode",
        "minimum",
        "maximum",
        "range",
        "variance",
        "standardDeviation",
        "coefficientVariation",
        "standardError",
        "q1",
        "q3",
        "iqr"
    ];

    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (id === "sampleSize") {
            element.textContent = "n = 0";
        } else {
            element.textContent = "—";
        }

    });

    errorMessage.style.display = "none";

    clearChart();
}


/* =========================
   COPY RESULTS
========================= */

function copyResults() {

    const text = `
STATISTICS CALCULATOR

Sample size: ${document.getElementById("sampleSize").textContent}

Mean: ${document.getElementById("mean").textContent}
Median: ${document.getElementById("median").textContent}
Mode: ${document.getElementById("mode").textContent}

Minimum: ${document.getElementById("minimum").textContent}
Maximum: ${document.getElementById("maximum").textContent}
Range: ${document.getElementById("range").textContent}

Variance: ${document.getElementById("variance").textContent}
Standard Deviation: ${document.getElementById("standardDeviation").textContent}
Coefficient of Variation: ${document.getElementById("coefficientVariation").textContent}
Standard Error: ${document.getElementById("standardError").textContent}

Q1: ${document.getElementById("q1").textContent}
Q3: ${document.getElementById("q3").textContent}
IQR: ${document.getElementById("iqr").textContent}
`;

    navigator.clipboard.writeText(text);

    copyBtn.textContent = "✓ Copied!";

    setTimeout(() => {
        copyBtn.textContent = "📋 Copy Results";
    }, 1500);
}


/* =========================
   CHART
========================= */

function drawChart(data) {

    const width = canvas.clientWidth;
    const height = 320;

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    ctx.clearRect(0, 0, width, height);


    if (data.length === 0) {
        return;
    }


    const padding = 45;

    const chartWidth =
        width - padding * 2;

    const chartHeight =
        height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);

    const difference =
        max - min || 1;


    /* GRID */

    ctx.strokeStyle = "#e5e9f0";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y =
            padding +
            (chartHeight / 4) * i;

        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width - padding,
            y
        );

        ctx.stroke();
    }


    /* DATA LINE */

    ctx.beginPath();

    data.forEach((value, index) => {

        const x =
            padding +
            (index /
                Math.max(data.length - 1, 1)) *
                chartWidth;

        const y =
            padding +
            chartHeight -
            ((value - min) / difference) *
                chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    });

    ctx.strokeStyle = "#5268ff";
    ctx.lineWidth = 3;
    ctx.stroke();


    /* DATA POINTS */

    data.forEach((value, index) => {

        const x =
            padding +
            (index /
                Math.max(data.length - 1, 1)) *
                chartWidth;

        const y =
            padding +
            chartHeight -
            ((value - min) / difference) *
                chartHeight;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#5268ff";

        ctx.fill();

    });


    /* MIN/MAX LABELS */

    ctx.fillStyle = "#758093";
    ctx.font = "12px Arial";

    ctx.fillText(
        max.toString(),
        8,
        padding + 5
    );

    ctx.fillText(
        min.toString(),
        8,
        height - padding
    );
}



/* =========================
   BOX PLOT
========================= */

function drawBoxPlot(data) {

    if (!boxPlotCanvas || !boxPlotCtx) {
        return;
    }

    const width =
        boxPlotCanvas.clientWidth;

    const height = 300;

    const ratio =
        window.devicePixelRatio || 1;
        
    boxPlotCanvas.width =
        width * ratio;

    boxPlotCanvas.height =
        height * ratio;

    boxPlotCtx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    boxPlotCtx.clearRect(
        0,
        0,
        width,
        height
    );


    const sorted =
        [...data].sort(
            (a, b) => a - b
        );

    const minimum =
        Math.min(...sorted);

    const maximum =
        Math.max(...sorted);

    const quartiles =
        calculateQuartiles(sorted);

    const q1 = quartiles.q1;
    const q3 = quartiles.q3;

    const median =
        calculateMedian(sorted);


    const padding = 60;

    const chartWidth =
        width - padding * 2;

    const range =
        maximum - minimum || 1;


    function mapX(value) {

        return padding +
            (
                (value - minimum) /
                range
            ) *
            chartWidth;

    }


    const y = height / 2;

    const boxHeight = 70;

    const boxTop =
        y - boxHeight / 2;

    const boxBottom =
        y + boxHeight / 2;


    /* WHISKERS */

    boxPlotCtx.strokeStyle =
        "#5268ff";

    boxPlotCtx.lineWidth = 2;


    boxPlotCtx.beginPath();

    boxPlotCtx.moveTo(
        mapX(minimum),
        y
    );

    boxPlotCtx.lineTo(
        mapX(q1),
        y
    );

    boxPlotCtx.stroke();


    boxPlotCtx.beginPath();

    boxPlotCtx.moveTo(
        mapX(q3),
        y
    );

    boxPlotCtx.lineTo(
        mapX(maximum),
        y
    );

    boxPlotCtx.stroke();


    /* WHISKER CAPS */

    boxPlotCtx.beginPath();

    boxPlotCtx.moveTo(
        mapX(minimum),
        boxTop + 15
    );

    boxPlotCtx.lineTo(
        mapX(minimum),
        boxBottom - 15
    );

    boxPlotCtx.stroke();


    boxPlotCtx.beginPath();

    boxPlotCtx.moveTo(
        mapX(maximum),
        boxTop + 15
    );

    boxPlotCtx.lineTo(
        mapX(maximum),
        boxBottom - 15
    );

    boxPlotCtx.stroke();


    /* BOX */

    boxPlotCtx.strokeRect(
        mapX(q1),
        boxTop,
        mapX(q3) - mapX(q1),
        boxHeight
    );


    /* MEDIAN */

    boxPlotCtx.beginPath();

    boxPlotCtx.moveTo(
        mapX(median),
        boxTop
    );

    boxPlotCtx.lineTo(
        mapX(median),
        boxBottom
    );

    boxPlotCtx.stroke();


    /* LABELS */

    boxPlotCtx.fillStyle =
        "#758093";

    boxPlotCtx.font =
        "12px Arial";

    boxPlotCtx.textAlign =
        "center";


    boxPlotCtx.fillText(
        `Min: ${formatNumber(minimum)}`,
        mapX(minimum),
        boxBottom + 30
    );

    boxPlotCtx.fillText(
        `Q1: ${formatNumber(q1)}`,
        mapX(q1),
        boxTop - 15
    );

    boxPlotCtx.fillText(
        `Median: ${formatNumber(median)}`,
        mapX(median),
        boxBottom + 30
    );

    boxPlotCtx.fillText(
        `Q3: ${formatNumber(q3)}`,
        mapX(q3),
        boxTop - 15
    );

    boxPlotCtx.fillText(
        `Max: ${formatNumber(maximum)}`,
        mapX(maximum),
        boxBottom + 30
    );

}
/* =========================
   CLEAR CHART
========================= */

function clearChart() {

    const width = canvas.clientWidth;
    const height = 320;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );
}


/* =========================
   BUTTON EVENTS
========================= */

calculateBtn.addEventListener(
    "click",
    calculateStatistics
);

clearBtn.addEventListener(
    "click",
    clearCalculator
);

copyBtn.addEventListener(
    "click",
    copyResults
);


/* =========================
   RESPONSIVE CHART
========================= */

window.addEventListener(
    "resize",
    () => {

        try {

            const data = getData();

            drawChart(
                [...data].sort(
                    (a, b) => a - b
                )
            );

        } catch {

            clearChart();

        }

    });

/* =========================
   FREQUENCY TABLE
========================= */

/* =========================
   FREQUENCY TABLE
========================= */

function createFrequencyTable(data) {

    const frequency = {};

    // Count each value
    data.forEach(value => {

        if (frequency[value]) {

            frequency[value]++;

        } else {

            frequency[value] = 1;

        }

    });


    // Sort the unique values
    const values =
        Object.keys(frequency)
            .map(Number)
            .sort((a, b) => a - b);


    const total = data.length;

    let cumulativeFrequency = 0;


    const tableBody =
        document.getElementById(
            "frequencyTableBody"
        );


    // Clear old rows
    tableBody.innerHTML = "";


    // Create each row
    values.forEach(value => {

        const currentFrequency =
            frequency[value];


        const relativeFrequency =
            currentFrequency / total;


        cumulativeFrequency +=
            currentFrequency;


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${value}</td>
            <td>${currentFrequency}</td>
            <td>${(relativeFrequency * 100).toFixed(2)}%</td>
            <td>${cumulativeFrequency}</td>
        `;


        tableBody.appendChild(row);

    });

}

/* =========================
   PERCENTILE CALCULATOR
========================= */

function calculatePercentile(data, percentile) {

    const sorted = [...data].sort((a, b) => a - b);

    const position =
        (percentile / 100) * (sorted.length - 1);

    const lowerIndex = Math.floor(position);

    const upperIndex = Math.ceil(position);

    if (lowerIndex === upperIndex) {
        return sorted[lowerIndex];
    }

    const weight = position - lowerIndex;

    return (
        sorted[lowerIndex] +
        weight *
        (sorted[upperIndex] - sorted[lowerIndex])
    );
}
document
    .getElementById("percentileBtn")
    .addEventListener("click", () => {

        try {

            const data = getData();

            const percentileInput =
                document.getElementById(
                    "percentileInput"
                ).value;

            if (percentileInput === "") {
                throw new Error(
                    "Please enter a percentile."
                );
            }

            const percentile =
                Number(percentileInput);

            if (
                percentile < 0 ||
                percentile > 100
            ) {
                throw new Error(
                    "Percentile must be between 0 and 100."
                );
            }

            const result =
                calculatePercentile(
                    data,
                    percentile
                );

            document.getElementById(
                "percentileResult"
            ).textContent =
                `${percentile}th percentile = ${formatNumber(result)}`;

        } catch (error) {

            document.getElementById(
                "percentileResult"
            ).textContent =
                "⚠️ " + error.message;

        }

    });

    /* =========================
   Z-SCORE CALCULATOR
========================= */

function calculateZScore(value, mean, standardDeviation) {

    return (value - mean) / standardDeviation;

}
document
    .getElementById("zScoreBtn")
    .addEventListener("click", () => {

        try {

            const data = getData();

            const valueInput =
                document.getElementById(
                    "zScoreValue"
                ).value;

            if (valueInput === "") {

                throw new Error(
                    "Please enter a value."
                );

            }

            const value = Number(valueInput);

            const mean =
                calculateMean(data);

            const type =
                document.querySelector(
                    'input[name="dataType"]:checked'
                ).value;

            const variance =
                calculateVariance(data, type);

            const standardDeviation =
                Math.sqrt(variance);

            if (standardDeviation === 0) {

                throw new Error(
                    "Z-score cannot be calculated when standard deviation is zero."
                );

            }

            const z =
                calculateZScore(
                    value,
                    mean,
                    standardDeviation
                );

            let interpretation;

            if (z > 0) {

                interpretation =
                    `The value is ${Math.abs(z).toFixed(2)} standard deviations above the mean.`;

            } else if (z < 0) {

                interpretation =
                    `The value is ${Math.abs(z).toFixed(2)} standard deviations below the mean.`;

            } else {

                interpretation =
                    "The value is exactly at the mean.";

            }

            document.getElementById(
                "zScoreResult"
            ).textContent =
                `z-score = ${z.toFixed(2)}. ${interpretation}`;

        } catch (error) {

            document.getElementById(
                "zScoreResult"
            ).textContent =
                "⚠️ " + error.message;

        }

    });
    /* =========================
   T CRITICAL VALUES
========================= */

const tCriticalValues = {

    0.90: [
        6.314,
        2.920,
        2.353,
        2.132,
        2.015,
        1.943,
        1.895,
        1.860,
        1.833,
        1.812,
        1.796,
        1.782,
        1.771,
        1.761,
        1.753,
        1.746,
        1.740,
        1.734,
        1.729,
        1.725,
        1.721,
        1.717,
        1.714,
        1.711,
        1.708,
        1.706,
        1.703,
        1.701,
        1.699,
        1.697
    ],

    0.95: [
        12.706,
        4.303,
        3.182,
        2.776,
        2.571,
        2.447,
        2.365,
        2.306,
        2.262,
        2.228,
        2.201,
        2.179,
        2.160,
        2.145,
        2.131,
        2.120,
        2.110,
        2.101,
        2.093,
        2.086,
        2.080,
        2.074,
        2.069,
        2.064,
        2.060,
        2.056,
        2.052,
        2.048,
        2.045,
        2.042
    ],

    0.99: [
        63.657,
        9.925,
        5.841,
        4.604,
        4.032,
        3.707,
        3.499,
        3.355,
        3.250,
        3.169,
        3.106,
        3.055,
        3.012,
        2.977,
        2.947,
        2.921,
        2.898,
        2.878,
        2.861,
        2.845,
        2.831,
        2.819,
        2.807,
        2.797,
        2.787,
        2.779,
        2.771,
        2.763,
        2.756,
        2.750
    ]

};
function getTCritical(confidenceLevel, degreesOfFreedom) {

    const values =
        tCriticalValues[confidenceLevel];

    if (degreesOfFreedom >= 1 &&
        degreesOfFreedom <= 30) {

        return values[degreesOfFreedom - 1];

    }

    /*
       For df > 30, use an approximation
       approaching the normal critical value.
    */

    const zValues = {
        0.90: 1.645,
        0.95: 1.960,
        0.99: 2.576
    };

    return zValues[confidenceLevel];
}
/* =========================
   CONFIDENCE INTERVAL
========================= */

function calculateConfidenceInterval() {

    try {

        const data = getData();

        if (data.length < 2) {

            throw new Error(
                "At least two observations are required."
            );

        }

        const confidenceLevel =
            Number(
                document.getElementById(
                    "confidenceLevel"
                ).value
            );


        const mean =
            calculateMean(data);


        /*
           Always use SAMPLE SD for a confidence
           interval estimating a population mean.
        */

        const sampleVariance =
            calculateVariance(
                data,
                "sample"
            );


        const sampleSD =
            Math.sqrt(sampleVariance);


        const n = data.length;


        const standardError =
            sampleSD / Math.sqrt(n);


        const degreesOfFreedom =
            n - 1;


        const criticalValue =
            getTCritical(
                confidenceLevel,
                degreesOfFreedom
            );


        const marginOfError =
            criticalValue *
            standardError;


        const lower =
            mean - marginOfError;


        const upper =
            mean + marginOfError;


        /* DISPLAY */

        document.getElementById(
            "ciMean"
        ).textContent =
            formatNumber(mean);


        document.getElementById(
            "ciSD"
        ).textContent =
            formatNumber(sampleSD);


        document.getElementById(
            "ciN"
        ).textContent =
            n;


        document.getElementById(
            "ciSE"
        ).textContent =
            formatNumber(standardError);


        document.getElementById(
            "ciCritical"
        ).textContent =
            formatNumber(criticalValue);


        document.getElementById(
            "ciMargin"
        ).textContent =
            formatNumber(marginOfError);


        document.getElementById(
            "ciLower"
        ).textContent =
            formatNumber(lower);


        document.getElementById(
            "ciUpper"
        ).textContent =
            formatNumber(upper);


        const percentage =
            confidenceLevel * 100;


        document.getElementById(
            "confidenceInterpretation"
        ).textContent =
            `Using a ${percentage}% confidence level, `
            + `the estimated population mean is between `
            + `${formatNumber(lower)} and `
            + `${formatNumber(upper)}.`;


    } catch (error) {

        document.getElementById(
            "confidenceInterpretation"
        ).textContent =
            "⚠️ " + error.message;

    }

}
document
    .getElementById("confidenceBtn")
    .addEventListener(
        "click",
        calculateConfidenceInterval
    );
    /* =========================
   GAMMA FUNCTION
========================= */

function gamma(z) {

    const coefficients = [
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];

    if (z < 0.5) {

        return Math.PI /
            (
                Math.sin(Math.PI * z) *
                gamma(1 - z)
            );

    }

    z -= 1;

    let x = 0.99999999999980993;

    for (let i = 0; i < coefficients.length; i++) {

        x +=
            coefficients[i] /
            (z + i + 1);

    }

    const t = z + coefficients.length - 0.5;

    return (
        Math.sqrt(2 * Math.PI) *
        Math.pow(t, z + 0.5) *
        Math.exp(-t) *
        x
    );
}
/* =========================
   T DISTRIBUTION PDF
========================= */

function tPDF(x, df) {

    const numerator =
        gamma((df + 1) / 2);

    const denominator =
        Math.sqrt(df * Math.PI) *
        gamma(df / 2);

    const power =
        -(df + 1) / 2;

    return (
        numerator /
        denominator
    ) *
    Math.pow(
        1 + (x * x) / df,
        power
    );
}
/* =========================
   T DISTRIBUTION CDF
========================= */

function tCDF(t, df) {

    if (t === 0) {
        return 0.5;
    }

    const sign = t < 0 ? -1 : 1;

    const x = Math.abs(t);

    if (x > 20) {
        return sign === 1 ? 1 : 0;
    }

    const steps = 4000;
    const h = x / steps;

    let sum =
        tPDF(0, df) +
        tPDF(x, df);

    for (let i = 1; i < steps; i++) {

        const currentX = i * h;

        const multiplier =
            i % 2 === 0 ? 2 : 4;

        sum +=
            multiplier *
            tPDF(currentX, df);

    }

    const integral =
        (h / 3) * sum;

    if (sign === 1) {
        return 0.5 + integral;
    }

    return 0.5 - integral;
}
/* =========================
   P-VALUE
========================= */

function calculateTPValue(
    tStatistic,
    df,
    alternative
) {

    const cdf =
        tCDF(tStatistic, df);

    if (alternative === "two-tailed") {

        return 2 *
            (1 - tCDF(
                Math.abs(tStatistic),
                df
            ));

    }

    if (alternative === "greater") {

        return 1 - cdf;

    }

    return cdf;
}
/* =========================
   ONE-SAMPLE T-TEST
========================= */

function runOneSampleTTest() {

    try {

        const data = getData();

        if (data.length < 2) {

            throw new Error(
                "At least two observations are required."
            );

        }

        const hypothesizedMeanInput =
            document.getElementById(
                "hypothesizedMean"
            ).value;

        if (hypothesizedMeanInput === "") {

            throw new Error(
                "Please enter a hypothesized mean."
            );

        }

        const hypothesizedMean =
            Number(hypothesizedMeanInput);


        const alternative =
            document.getElementById(
                "alternativeHypothesis"
            ).value;


        const alpha =
            Number(
                document.getElementById(
                    "significanceLevel"
                ).value
            );


        const mean =
            calculateMean(data);


        const sampleVariance =
            calculateVariance(
                data,
                "sample"
            );


        const sampleSD =
            Math.sqrt(sampleVariance);


        const n =
            data.length;


        const standardError =
            sampleSD / Math.sqrt(n);


        const df =
            n - 1;


        const tStatistic =
            (
                mean -
                hypothesizedMean
            ) / standardError;


        const pValue =
            calculateTPValue(
                tStatistic,
                df,
                alternative
            );


        /* =========================
           DISPLAY
        ========================= */

        document.getElementById(
            "ttestMean"
        ).textContent =
            formatNumber(mean);


        document.getElementById(
            "ttestSD"
        ).textContent =
            formatNumber(sampleSD);


        document.getElementById(
            "ttestN"
        ).textContent =
            n;


        document.getElementById(
            "ttestStatistic"
        ).textContent =
            formatNumber(tStatistic);


        document.getElementById(
            "ttestDF"
        ).textContent =
            df;


        document.getElementById(
            "ttestPValue"
        ).textContent =
            pValue.toFixed(4);


        /* =========================
           DECISION
        ========================= */

        const rejectNull =
            pValue < alpha;


        let decision;

        if (rejectNull) {

            decision =
                `Reject H₀ at α = ${alpha}. ` +
                `There is sufficient evidence ` +
                `that the population mean differs ` +
                `from ${hypothesizedMean}.`;

        } else {

            decision =
                `Fail to reject H₀ at α = ${alpha}. ` +
                `There is not sufficient evidence ` +
                `that the population mean differs ` +
                `from ${hypothesizedMean}.`;

        }


        document.getElementById(
            "ttestDecision"
        ).textContent =
            decision;


    } catch (error) {

        document.getElementById(
            "ttestDecision"
        ).textContent =
            "⚠️ " + error.message;

    }

}
document
    .getElementById("ttestBtn")
    .addEventListener(
        "click",
        runOneSampleTTest
    );
    /* =========================
   TWO-SAMPLE DATA PARSER
========================= */

function parseGroupData(inputId) {

    const input =
        document.getElementById(inputId).value.trim();

    if (!input) {
        throw new Error(
            "Please enter data for both groups."
        );
    }

    const values = input
        .split(/[\s,]+/)
        .map(Number);

    if (values.some(value => Number.isNaN(value))) {
        throw new Error(
            "Both groups must contain numbers only."
        );
    }

    if (values.length < 2) {
        throw new Error(
            "Each group must contain at least two observations."
        );
    }

    return values;
}
/* =========================
   WELCH T-TEST
========================= */

function calculateWelchTTest(
    groupA,
    groupB
) {

    const meanA =
        calculateMean(groupA);

    const meanB =
        calculateMean(groupB);

    const varianceA =
        calculateVariance(
            groupA,
            "sample"
        );

    const varianceB =
        calculateVariance(
            groupB,
            "sample"
        );

    const nA = groupA.length;
    const nB = groupB.length;


    const standardError =
        Math.sqrt(
            varianceA / nA +
            varianceB / nB
        );


    const tStatistic =
        (meanA - meanB) /
        standardError;


    /*
       Welch-Satterthwaite degrees of freedom
    */

    const numerator =
        Math.pow(
            varianceA / nA +
            varianceB / nB,
            2
        );


    const denominator =
        (
            Math.pow(
                varianceA / nA,
                2
            ) /
            (nA - 1)
        )
        +
        (
            Math.pow(
                varianceB / nB,
                2
            ) /
            (nB - 1)
        );


    const degreesOfFreedom =
        numerator / denominator;


    return {
        meanA,
        meanB,
        sdA: Math.sqrt(varianceA),
        sdB: Math.sqrt(varianceB),
        tStatistic,
        degreesOfFreedom
    };

}
/* =========================
   RUN TWO-SAMPLE T-TEST
========================= */

function runTwoSampleTTest() {

    try {

        const groupA =
            parseGroupData(
                "groupAData"
            );

        const groupB =
            parseGroupData(
                "groupBData"
            );


        const alternative =
            document.getElementById(
                "twoSampleAlternative"
            ).value;


        const alpha =
            Number(
                document.getElementById(
                    "twoSampleAlpha"
                ).value
            );


        const result =
            calculateWelchTTest(
                groupA,
                groupB
            );


        const pValue =
            calculateTPValue(
                result.tStatistic,
                result.degreesOfFreedom,
                alternative
            );


        /* =========================
           DISPLAY RESULTS
        ========================= */

        document.getElementById(
            "groupAMean"
        ).textContent =
            formatNumber(
                result.meanA
            );


        document.getElementById(
            "groupBMean"
        ).textContent =
            formatNumber(
                result.meanB
            );


        document.getElementById(
            "groupASD"
        ).textContent =
            formatNumber(
                result.sdA
            );


        document.getElementById(
            "groupBSD"
        ).textContent =
            formatNumber(
                result.sdB
            );


        document.getElementById(
            "twoSampleTStatistic"
        ).textContent =
            formatNumber(
                result.tStatistic
            );


        document.getElementById(
            "twoSampleDF"
        ).textContent =
            formatNumber(
                result.degreesOfFreedom
            );


        document.getElementById(
            "twoSamplePValue"
        ).textContent =
            pValue.toFixed(4);


        /* =========================
           DECISION
        ========================= */

        if (pValue < alpha) {

            document.getElementById(
                "twoSampleDecision"
            ).textContent =
                `Reject H₀ at α = ${alpha}. ` +
                `There is sufficient evidence ` +
                `that the two population means differ.`;

        } else {

            document.getElementById(
                "twoSampleDecision"
            ).textContent =
                `Fail to reject H₀ at α = ${alpha}. ` +
                `There is not sufficient evidence ` +
                `that the two population means differ.`;

        }

    } catch (error) {

        document.getElementById(
            "twoSampleDecision"
        ).textContent =
            "⚠️ " + error.message;

    }

}
document
    .getElementById("twoSampleTTestBtn")
    .addEventListener(
        "click",
        runTwoSampleTTest
    );
    /* =========================
   CHI-SQUARE DATA PARSER
========================= */

function parseFrequencyData(inputId) {

    const input =
        document.getElementById(inputId).value.trim();

    if (!input) {
        throw new Error(
            "Please enter both observed and expected frequencies."
        );
    }

    const values = input
        .split(/[\s,]+/)
        .map(Number);

    if (values.some(value => Number.isNaN(value))) {
        throw new Error(
            "Frequencies must contain numbers only."
        );
    }

    if (values.length < 2) {
        throw new Error(
            "Please enter at least two categories."
        );
    }

    if (values.some(value => value < 0)) {
        throw new Error(
            "Frequencies cannot be negative."
        );
    }

    return values;
}
/* =========================
   CHI-SQUARE STATISTIC
========================= */

function calculateChiSquare(
    observed,
    expected
) {

    let statistic = 0;

    for (let i = 0; i < observed.length; i++) {

        statistic +=
            Math.pow(
                observed[i] - expected[i],
                2
            ) / expected[i];

    }

    return statistic;
}
/* =========================
   REGULARIZED GAMMA Q
========================= */

function gammaSeries(a, x) {

    const maxIterations = 100;
    const epsilon = 1e-12;

    let sum = 1 / a;
    let term = sum;

    for (let n = 1; n <= maxIterations; n++) {

        term *= x / (a + n);

        sum += term;

        if (Math.abs(term) < Math.abs(sum) * epsilon) {
            break;
        }
    }

    return (
        sum *
        Math.exp(
            -x +
            a * Math.log(x) -
            Math.log(gamma(a))
        )
    ) / a;
}


function gammaContinuedFraction(a, x) {

    const maxIterations = 100;
    const epsilon = 1e-12;
    const tiny = 1e-30;

    let b = x + 1 - a;
    let c = 1 / tiny;
    let d = 1 / Math.max(b, tiny);

    let h = d;

    for (let i = 1; i <= maxIterations; i++) {

        const an = -i * (i - a);

        b += 2;

        d =
            an * d +
            b;

        if (Math.abs(d) < tiny) {
            d = tiny;
        }

        c =
            b +
            an / c;

        if (Math.abs(c) < tiny) {
            c = tiny;
        }

        d = 1 / d;

        const delta = d * c;

        h *= delta;

        if (Math.abs(delta - 1) < epsilon) {
            break;
        }
    }

    return (
        Math.exp(
            -x +
            a * Math.log(x) -
            Math.log(gamma(a))
        ) *
        h
    );
}


function regularizedGammaQ(a, x) {

    if (x < 0 || a <= 0) {
        return NaN;
    }

    if (x === 0) {
        return 1;
    }

    if (x < a + 1) {

        const lower =
            gammaSeries(a, x);

        return 1 - lower;

    }

    return gammaContinuedFraction(a, x);
}
/* =========================
   CHI-SQUARE P-VALUE
========================= */

function chiSquarePValue(
    statistic,
    degreesOfFreedom
) {

    return regularizedGammaQ(
        degreesOfFreedom / 2,
        statistic / 2
    );
}
/* =========================
   RUN CHI-SQUARE TEST
========================= */

function runChiSquareTest() {

    try {

        const observed =
            parseFrequencyData(
                "observedData"
            );

        const expected =
            parseFrequencyData(
                "expectedData"
            );


        if (
            observed.length !==
            expected.length
        ) {

            throw new Error(
                "Observed and expected data must contain the same number of categories."
            );

        }


        if (
            expected.some(
                value => value <= 0
            )
        ) {

            throw new Error(
                "Expected frequencies must be greater than zero."
            );

        }


        const observedTotal =
            observed.reduce(
                (sum, value) =>
                    sum + value,
                0
            );

        const expectedTotal =
            expected.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        /*
           For a standard goodness-of-fit test,
           observed and expected totals should match.
        */

        if (
            Math.abs(
                observedTotal -
                expectedTotal
            ) > 1e-9
        ) {

            throw new Error(
                "Observed and expected frequencies must have the same total."
            );

        }


        const statistic =
            calculateChiSquare(
                observed,
                expected
            );


        const degreesOfFreedom =
            observed.length - 1;


        const pValue =
            chiSquarePValue(
                statistic,
                degreesOfFreedom
            );


        const alpha =
            Number(
                document.getElementById(
                    "chiAlpha"
                ).value
            );


        /* =========================
           DISPLAY
        ========================= */

        document.getElementById(
            "chiSquareStatistic"
        ).textContent =
            formatNumber(statistic);


        document.getElementById(
            "chiSquareDF"
        ).textContent =
            degreesOfFreedom;


        document.getElementById(
            "chiSquarePValue"
        ).textContent =
            pValue.toFixed(4);


        /* =========================
           DECISION
        ========================= */

        if (pValue < alpha) {

            document.getElementById(
                "chiSquareDecision"
            ).textContent =
                `Reject H₀ at α = ${alpha}. ` +
                `There is sufficient evidence ` +
                `that the observed frequencies differ ` +
                `from the expected frequencies.`;

        } else {

            document.getElementById(
                "chiSquareDecision"
            ).textContent =
                `Fail to reject H₀ at α = ${alpha}. ` +
                `There is not sufficient evidence ` +
                `that the observed frequencies differ ` +
                `from the expected frequencies.`;

        }


    } catch (error) {

        document.getElementById(
            "chiSquareDecision"
        ).textContent =
            "⚠️ " + error.message;

    }

}
document
    .getElementById("chiSquareBtn")
    .addEventListener(
        "click",
        runChiSquareTest
    );
    /* =========================
   CORRELATION DATA PARSER
========================= */

function parsePairedData(inputId) {

    const input =
        document.getElementById(inputId).value.trim();

    if (!input) {
        throw new Error(
            "Please enter both X and Y values."
        );
    }

    const values = input
        .split(/[\s,]+/)
        .map(Number);

    if (values.some(value => Number.isNaN(value))) {
        throw new Error(
            "X and Y values must contain numbers only."
        );
    }

    return values;
}
/* =========================
   PEARSON CORRELATION
========================= */

function calculateCorrelation(x, y) {

    if (x.length !== y.length) {

        throw new Error(
            "X and Y must contain the same number of values."
        );

    }

    if (x.length < 2) {

        throw new Error(
            "At least two paired observations are required."
        );

    }

    const meanX = calculateMean(x);
    const meanY = calculateMean(y);

    let numerator = 0;
    let sumSquaredX = 0;
    let sumSquaredY = 0;

    for (let i = 0; i < x.length; i++) {

        const dx = x[i] - meanX;
        const dy = y[i] - meanY;

        numerator += dx * dy;
        sumSquaredX += dx * dx;
        sumSquaredY += dy * dy;

    }

    if (
        sumSquaredX === 0 ||
        sumSquaredY === 0
    ) {

        throw new Error(
            "Correlation cannot be calculated when one variable has no variation."
        );

    }

    return numerator /
        Math.sqrt(
            sumSquaredX * sumSquaredY
        );
}
function interpretCorrelation(r) {

    const absoluteR = Math.abs(r);

    let strength;

    if (absoluteR < 0.20) {
        strength = "very weak";
    } else if (absoluteR < 0.40) {
        strength = "weak";
    } else if (absoluteR < 0.60) {
        strength = "moderate";
    } else if (absoluteR < 0.80) {
        strength = "strong";
    } else {
        strength = "very strong";
    }

    let direction;

    if (r > 0) {
        direction = "positive";
    } else if (r < 0) {
        direction = "negative";
    } else {
        direction = "no";
    }

    if (r === 0) {
        return "There is no linear correlation.";
    }

    return `There is a ${strength} ${direction} linear correlation.`;
}
/* =========================
   RUN CORRELATION
========================= */

function runCorrelation() {

    try {

        const x =
            parsePairedData("xData");

        const y =
            parsePairedData("yData");

        const r =
            calculateCorrelation(x, y);

        document.getElementById(
            "correlationR"
        ).textContent =
            r.toFixed(4);

        document.getElementById(
            "correlationN"
        ).textContent =
            x.length;

        document.getElementById(
            "correlationInterpretation"
        ).textContent =
            interpretCorrelation(r);

        drawScatterplot(x, y);

    } catch (error) {

        document.getElementById(
            "correlationInterpretation"
        ).textContent =
            "⚠️ " + error.message;

    }

}
document
    .getElementById("correlationBtn")
    .addEventListener(
        "click",
        runCorrelation
    );
    /* =========================
   SCATTERPLOT
========================= */

function drawScatterplot(x, y) {

    const width = canvas.clientWidth;
    const height = 320;

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    ctx.clearRect(0, 0, width, height);

    const padding = 50;

    const chartWidth =
        width - padding * 2;

    const chartHeight =
        height - padding * 2;

    const minX = Math.min(...x);
    const maxX = Math.max(...x);

    const minY = Math.min(...y);
    const maxY = Math.max(...y);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;


    /* GRID */

    ctx.strokeStyle = "#e5e9f0";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const horizontalY =
            padding +
            (chartHeight / 4) * i;

        const verticalX =
            padding +
            (chartWidth / 4) * i;

        ctx.beginPath();
        ctx.moveTo(
            padding,
            horizontalY
        );
        ctx.lineTo(
            width - padding,
            horizontalY
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(
            verticalX,
            padding
        );
        ctx.lineTo(
            verticalX,
            height - padding
        );
        ctx.stroke();

    }


    /* AXES */

    ctx.strokeStyle = "#8c95a5";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(
        padding,
        height - padding
    );
    ctx.lineTo(
        width - padding,
        height - padding
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
        padding,
        padding
    );
    ctx.lineTo(
        padding,
        height - padding
    );
    ctx.stroke();


    /* POINTS */

    x.forEach((xValue, i) => {

        const yValue = y[i];

        const pointX =
            padding +
            (
                (xValue - minX) /
                rangeX
            ) * chartWidth;

        const pointY =
            height -
            padding -
            (
                (yValue - minY) /
                rangeY
            ) * chartHeight;

        ctx.beginPath();

        ctx.arc(
            pointX,
            pointY,
            5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#5268ff";

        ctx.fill();

    });


    /* LABELS */

    ctx.fillStyle = "#758093";
    ctx.font = "12px Arial";

    ctx.fillText(
        minX.toString(),
        padding,
        height - 20
    );

    ctx.fillText(
        maxX.toString(),
        width - padding - 20,
        height - 20
    );

    ctx.fillText(
        maxY.toString(),
        10,
        padding + 5
    );

    ctx.fillText(
        minY.toString(),
        10,
        height - padding
    );

}
/* =========================
   LINEAR REGRESSION
========================= */

function calculateRegression(x, y) {

    if (x.length !== y.length) {

        throw new Error(
            "X and Y must contain the same number of values."
        );

    }

    if (x.length < 2) {

        throw new Error(
            "At least two paired observations are required."
        );

    }

    const meanX = calculateMean(x);
    const meanY = calculateMean(y);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < x.length; i++) {

        const xDifference =
            x[i] - meanX;

        const yDifference =
            y[i] - meanY;

        numerator +=
            xDifference * yDifference;

        denominator +=
            xDifference * xDifference;

    }

    if (denominator === 0) {

        throw new Error(
            "Regression cannot be calculated when X has no variation."
        );

    }

    const slope =
        numerator / denominator;

    const intercept =
        meanY - slope * meanX;

    return {
        slope,
        intercept,
        meanX,
        meanY
    };

}
/* =========================
   R-SQUARED
========================= */

function calculateRSquared(x, y, slope, intercept) {

    const meanY =
        calculateMean(y);

    let totalSumSquares = 0;
    let residualSumSquares = 0;

    for (let i = 0; i < y.length; i++) {

        const predictedY =
            intercept +
            slope * x[i];

        totalSumSquares +=
            Math.pow(
                y[i] - meanY,
                2
            );

        residualSumSquares +=
            Math.pow(
                y[i] - predictedY,
                2
            );

    }

    if (totalSumSquares === 0) {
        return NaN;
    }

    return 1 -
        (
            residualSumSquares /
            totalSumSquares
        );
}
/* =========================
   RUN REGRESSION
========================= */
function runRegression() {

    try {

        const x =
            parsePairedData("regressionX");

        const y =
            parsePairedData("regressionY");

        const result =
            calculateRegression(x, y);

        const rSquared =
            calculateRSquared(
                x,
                y,
                result.slope,
                result.intercept
            );


        /* =========================
           DISPLAY
        ========================= */

        document.getElementById(
            "regressionSlope"
        ).textContent =
            result.slope.toFixed(4);

        document.getElementById(
            "regressionIntercept"
        ).textContent =
            result.intercept.toFixed(4);

        document.getElementById(
            "regressionR2"
        ).textContent =
            rSquared.toFixed(4);


        /* =========================
           EQUATION
        ========================= */

        const sign =
            result.intercept >= 0
                ? "+"
                : "−";

        const interceptValue =
            Math.abs(
                result.intercept
            ).toFixed(4);

        document.getElementById(
            "regressionEquation"
        ).textContent =
            `ŷ = ${result.slope.toFixed(4)}x ${sign} ${interceptValue}`;


        /* =========================
           INTERPRETATION
        ========================= */

        document.getElementById(
            "regressionInterpretation"
        ).textContent =
            `The model explains approximately ` +
            `${(rSquared * 100).toFixed(2)}% ` +
            `of the variation in Y.`;


        /* =========================
           REGRESSION PLOT
        ========================= */

        drawRegressionPlot(
            x,
            y,
            result.slope,
            result.intercept
        );


    } catch (error) {

        document.getElementById(
            "regressionInterpretation"
        ).textContent =
            "⚠️ " + error.message;

    }

}


document
    .getElementById("regressionBtn")
    .addEventListener(
        "click",
        runRegression
    );
/* =========================
   REGRESSION PLOT
========================= */

function drawRegressionPlot(
    x,
    y,
    slope,
    intercept
) {

    const width =
        regressionCanvas.clientWidth;

    const height = 350;

    const ratio =
        window.devicePixelRatio || 1;

    regressionCanvas.width =
        width * ratio;

    regressionCanvas.height =
        height * ratio;

    regressionCtx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    regressionCtx.clearRect(
        0,
        0,
        width,
        height
    );


    const padding = 50;

    const chartWidth =
        width - padding * 2;

    const chartHeight =
        height - padding * 2;


    const minX =
        Math.min(...x);

    const maxX =
        Math.max(...x);

    const minY =
        Math.min(...y);

    const maxY =
        Math.max(...y);


    const xRange =
        maxX - minX || 1;

    const yRange =
        maxY - minY || 1;


    /*
       Add a little space around
       the observations.
    */

    const xPadding =
        xRange * 0.05;

    const yPadding =
        yRange * 0.10;


    const plotMinX =
        minX - xPadding;

    const plotMaxX =
        maxX + xPadding;

    const plotMinY =
        minY - yPadding;

    const plotMaxY =
        maxY + yPadding;


    const plotXRange =
        plotMaxX - plotMinX;

    const plotYRange =
        plotMaxY - plotMinY;


    function mapX(value) {

        return padding +
            (
                (value - plotMinX) /
                plotXRange
            ) *
            chartWidth;

    }


    function mapY(value) {

        return height -
            padding -
            (
                (value - plotMinY) /
                plotYRange
            ) *
            chartHeight;

    }


    /* =========================
       GRID
    ========================= */

    regressionCtx.strokeStyle =
        "#e5e9f0";

    regressionCtx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {

        const xPosition =
            padding +
            (chartWidth / 5) * i;

        const yPosition =
            padding +
            (chartHeight / 5) * i;


        regressionCtx.beginPath();

        regressionCtx.moveTo(
            xPosition,
            padding
        );

        regressionCtx.lineTo(
            xPosition,
            height - padding
        );

        regressionCtx.stroke();


        regressionCtx.beginPath();

        regressionCtx.moveTo(
            padding,
            yPosition
        );

        regressionCtx.lineTo(
            width - padding,
            yPosition
        );

        regressionCtx.stroke();

    }


    /* =========================
       AXES
    ========================= */

    regressionCtx.strokeStyle =
        "#8c95a5";

    regressionCtx.lineWidth = 2;


    regressionCtx.beginPath();

    regressionCtx.moveTo(
        padding,
        height - padding
    );

    regressionCtx.lineTo(
        width - padding,
        height - padding
    );

    regressionCtx.stroke();


    regressionCtx.beginPath();

    regressionCtx.moveTo(
        padding,
        padding
    );

    regressionCtx.lineTo(
        padding,
        height - padding
    );

    regressionCtx.stroke();


    /* =========================
       REGRESSION LINE
    ========================= */

    const lineStartX =
        plotMinX;

    const lineEndX =
        plotMaxX;

    const lineStartY =
        intercept +
        slope * lineStartX;

    const lineEndY =
        intercept +
        slope * lineEndX;


    regressionCtx.beginPath();

    regressionCtx.moveTo(
        mapX(lineStartX),
        mapY(lineStartY)
    );

    regressionCtx.lineTo(
        mapX(lineEndX),
        mapY(lineEndY)
    );

    regressionCtx.strokeStyle =
        "#5268ff";

    regressionCtx.lineWidth = 3;

    regressionCtx.stroke();


    /* =========================
       OBSERVED POINTS
    ========================= */

    for (let i = 0; i < x.length; i++) {

        const pointX =
            mapX(x[i]);

        const pointY =
            mapY(y[i]);


        regressionCtx.beginPath();

        regressionCtx.arc(
            pointX,
            pointY,
            6,
            0,
            Math.PI * 2
        );

        regressionCtx.fillStyle =
            "#172033";

        regressionCtx.fill();

    }


    /* =========================
       LABELS
    ========================= */

    regressionCtx.fillStyle =
        "#758093";

    regressionCtx.font =
        "12px Arial";


    regressionCtx.fillText(
        plotMinX.toFixed(2),
        padding,
        height - 20
    );


    regressionCtx.fillText(
        plotMaxX.toFixed(2),
        width - padding - 35,
        height - 20
    );


    regressionCtx.fillText(
        plotMaxY.toFixed(2),
        8,
        padding + 5
    );


    regressionCtx.fillText(
        plotMinY.toFixed(2),
        8,
        height - padding
    );

}