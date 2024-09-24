function findConstantTerm(input) {
    const data = JSON.parse(input);
    const { n, k } = data.keys;

    // Decode values and create points array
    const points = [];
    for (let i = 1; i <= n; i++) {
        if (data[i]) {
            const x = parseInt(i);
            const y = parseInt(data[i].value, parseInt(data[i].base));
            points.push([x, y]);
        }
    }

    if (points.length < k) {
        throw new Error(
            "Not enough points provided to reconstruct the secret."
        );
    }

    // Lagrange interpolation function
    function lagrangeInterpolation(points, x) {
        let result = 0;
        for (let i = 0; i < points.length; i++) {
            let term = points[i][1];
            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    term =
                        (term * (x - points[j][0])) /
                        (points[i][0] - points[j][0]);
                }
            }
            result += term;
        }
        return result;
    }

    // Function to check if a point is consistent with a set of points
    function isConsistent(testPoint, consistentPoints) {
        const interpolated = Math.round(
            lagrangeInterpolation(consistentPoints, testPoint[0])
        );
        return Math.abs(interpolated - testPoint[1]) < 1e-6; // Allow for small floating-point errors
    }

    // Find the most consistent set of points
    function findConsistentPoints(points, k) {
        const n = points.length;
        let bestSet = [];
        let maxConsistent = 0;

        // Try all possible combinations of k points
        function backtrack(start, current) {
            if (current.length === k) {
                let consistent = 0;
                for (let point of points) {
                    if (isConsistent(point, current)) {
                        consistent++;
                    }
                }
                if (consistent > maxConsistent) {
                    maxConsistent = consistent;
                    bestSet = [...current];
                }
                return;
            }
            for (let i = start; i < n; i++) {
                current.push(points[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }

        backtrack(0, []);
        return bestSet;
    }

    // Find the most consistent set of k points
    const consistentPoints = findConsistentPoints(points, k);

    // Calculate the constant term using the consistent points
    const constantTerm = Math.round(lagrangeInterpolation(consistentPoints, 0));

    // Identify incorrect roots
    const incorrectRoots = points
        .filter((point) => !isConsistent(point, consistentPoints))
        .map((point) => point[0]);

    return {
        constantTerm,
        incorrectRoots,
    };
}

// Example usage
const input = `{
    "keys": {
        "n": 9,
        "k": 6
    },
    "1": {
        "base": "10",
        "value": "28735619723837"
    },
    "2": {
        "base": "16",
        "value": "1A228867F0CA"
    },
    "3": {
        "base": "12",
        "value": "32811A4AA0B7B"
    },
    "4": {
        "base": "11",
        "value": "917978721331A"
    },
    "5": {
        "base": "16",
        "value": "1A22886782E1"
    },
    "6": {
        "base": "10",
        "value": "28735619654702"
    },
    "7": {
        "base": "14",
        "value": "71AB5070CC4B"
    },
    "8": {
        "base": "9",
        "value": "122662581541670"
    },
    "9": {
        "base": "8",
        "value": "642121030037605"
    }
}`;

console.log(findConstantTerm(input));
