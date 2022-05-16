const numbers = [1, 2, 3, 4]

const getDouble = (number, calback) => {
    calback(number * multiplicator)
}

for (const number in numbers) {
    getDouble(number, function (data) {
        let multiplicator = 2

        console.log(data);
    });
}
