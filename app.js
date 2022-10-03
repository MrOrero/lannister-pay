const { response } = require('express');
const express = require('express');

const app = express();

app.use(express.json());

app.post('/split-payments/compute', (req, res, next) => {
    const payload = req.body;
    const id = payload.ID;
    const amount = payload.Amount;
    let balance = amount;
    const splitInfo = payload.SplitInfo;

    // FLAT TYPES FIRST
    const flatIndexes = getIndexes('FLAT');
    const flatArray = [];
    for (index of flatIndexes) {
        splitValue = splitInfo[index].SplitValue;
        splitEntityId = splitInfo[index].SplitEntityId;
        balance = balance - splitValue;
        flat = { SplitEntityId: splitEntityId, amount: splitValue };
        flatArray.push(flat);
    }
    console.log(flatArray);
    console.log('flat arrray balace is' + balance);

    const percentageIndexes = getIndexes('PERCENTAGE');
    const percentageArray = [];
    for (index of percentageIndexes) {
        splitValue = splitInfo[index].SplitValue;
        splitEntityId = splitInfo[index].SplitEntityId;
        const percentage = (splitValue / 100) * balance;
        balance = balance - percentage;
        flat = { SplitEntityId: splitEntityId, amount: percentage };
        percentageArray.push(flat);
    }
    console.log(percentageArray);
    console.log('percentage arrray balace is' + balance);

    const ratioIndexes = getIndexes('RATIO');
    const totalRatio = getTotalRatio(ratioIndexes);
    const ratioBalance = balance;
    const ratioArray = [];
    for (index of ratioIndexes) {
        splitValue = splitInfo[index].SplitValue;
        splitEntityId = splitInfo[index].SplitEntityId;
        const ratio = (splitValue / totalRatio) * ratioBalance;
        balance = balance - ratio;
        flat = { SplitEntityId: splitEntityId, amount: ratio };
        ratioArray.push(flat);
    }
    console.log(ratioArray);
    console.log(balance);

    const splitBreakdown = [...flatArray, ...percentageArray, ...ratioArray];
    const response = { ID: id, Balance: balance, splitBreakdown: splitBreakdown };
    console.log(splitBreakdown);

    res.status(200).json(response);

    function getTotalRatio(ratioIndexArray) {
        let total = 0;
        for (index of ratioIndexArray) {
            total = total + splitInfo[index].SplitValue;
        }
        return total;
    }

    function getIndexes(SplitType) {
        const indexes = [];
        let i;
        for (i = 0; i < splitInfo.length; i++)
            if (splitInfo[i].SplitType === SplitType) indexes.push(i);
        return indexes;
    }
});
app.listen(3000);
