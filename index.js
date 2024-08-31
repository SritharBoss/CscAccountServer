const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
var filePath = process.env['USERPROFILE'] + '/OneDrive/CSCAccountServer/files/';
if (!fs.existsSync(filePath)) {
  filePath = __dirname + "/files/";
}

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

process.env.TZ = 'Asia/Calcutta'



//API Start
app.get("/api/getFile", (req, res) => {
  const { date } = req.query;
  var fullPath = "";
  defaultData = JSON.stringify({ "date": new Date(), "accounts": [{ "name": "CASH IN HAND", "id": "accounts-1", "amount": 0 }, { "name": "PVL CUB", "id": "accounts-2", "amount": 0 }, { "name": "PVL SBI CR", "id": "accounts-3", "amount": 0 }, { "name": "PVL SBI SB", "id": "accounts-4", "amount": 0 }, { "name": "BHANU UBI", "id": "accounts-5", "amount": 0 }, { "name": "DIGIPAY", "id": "accounts-6", "amount": 0 }, { "name": "RABIPAY", "id": "accounts-7", "amount": 0 }, { "name": "BHANU SBI OD", "id": "accounts-8", "amount": 0 }, { "name": "BHANU SBI", "id": "accounts-9", "amount": 0 }, { "name": "CSC DIGITAL SEVA", "id": "accounts-10", "amount": 0 }, { "name": "SMART SHOP", "id": "accounts-11", "amount": 0 }, { "name": "I-NET", "id": "accounts-12", "amount": 0 }, { "name": "Google Business", "id": "accounts-13", "amount": 0 }], "services": [{ "name": "SUNDIRECT", "id": "serv-1", "amount": 0 }, { "name": "A/T DIGITAL TV", "id": "serv-2", "amount": 0 }, { "name": "Tata sky", "id": "serv-3", "amount": 0 }, { "name": "A/T MOBILE", "id": "serv-4", "amount": 0 }, { "name": "VODAFONE 1+2", "id": "serv-5", "amount": 0 }, { "name": "JIO 1+2", "id": "serv-6", "amount": 0 }, { "name": "BSNL", "id": "serv-7", "amount": 0 }, { "name": "V/C TV", "id": "serv-8", "amount": 0 }, { "name": "Bismi PAN", "id": "serv-9", "amount": 0 }, { "name": "Star Commu.", "id": "serv-10", "amount": 0 }], "custBalance": [], "cashBal": [{ "id": "cash_2", "denom": 500, "value": 0 }, { "id": "cash_3", "denom": 200, "value": 0 }, { "id": "cash_4", "denom": 100, "value": 0 }, { "id": "cash_5", "denom": 50, "value": 0 }, { "id": "cash_6", "denom": 20, "value": 0 }, { "id": "cash_7", "denom": 10, "value": 0 }, { "id": "cash_8", "denom": 5, "value": 0 }], "todayExpenses": [], "yestGT": 0, "yestDiff": 0, "currentGT": 0, "currentDiff": 0 ,"todayXeroxCounter":0, "yestXeroxCounter":0});
  if (date) {
    fullPath = filePath + date;

    if (getDateFromString(date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Date cannot be future.",
      });
    }

    if (!fs.existsSync(fullPath) && getDateFromString(date).toDateString() != new Date().toDateString()) {
      return res.status(400).json({
        success: false,
        message: "கணக்கு பார்க்கவில்லை",
      });
    }

    if (!fs.existsSync(fullPath)) {
      //write default data to the file
      let date1 = new Date()
      let date2 = getDateFromString(date)
      temp = JSON.parse(defaultData)
      temp.date = date2
      defaultData = JSON.stringify(temp)
      if (date1.getDay() == date2.getDay() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear()) {
        y = getYesterdayFileLoop(date);
        if (y != null) {
          json = JSON.parse(readFileSyncAsString(filePath + y))
          json.date = new Date()
          json.yestGT = json.currentGT
          json.yestDiff = json.currentDiff
          json.yestXeroxCounter = json.todayXeroxCounter
          json.currentGT = 0
          json.currentDiff = 0
          json.todayXeroxCounter=0;
          var temp=json.todayExpenses.slice(0,2)
          temp.forEach(element => {element.amount=0})
          json.todayExpenses = temp
          fs.writeFileSync(fullPath, JSON.stringify(json));
        } else {
          fs.writeFileSync(fullPath, defaultData);
        }
      } else {
        fs.writeFileSync(fullPath, defaultData);
      }

      console.log("File Written successfully.." + date);
    }

  } else {
    return res.status(400).json({
      success: false,
      message: "Date query param not sent",
    });
  }
  yest = getYesterdayFileLoop(date)
  tomorrorw = getTomorrowFileLoop(date)
  const jsonData = JSON.parse(readFileSyncAsString(fullPath));

  // Return a JSON response
  res.status(200).json({
    success: true,
    message: "GET request successful",
    yestFile: yest,
    tomorrorwFile: tomorrorw,
    data: jsonData
  });
});

app.post("/api/saveFile", (req, res) => {
  const { date } = req.query; // Access the query parameter
  var fullPath = "";
  if (date) {
    fullPath = filePath + date;
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: "Requested File Not Found",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Date query param not sent",
    });
  }

  const postData = JSON.stringify(req.body);
  // Check if the required query parameter is present
  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Missing required query parameter: Date",
    });
  }

  fs.writeFile(fullPath, postData, (err) => {
    if (err) {
      console.error("Error Writing the file:", err);
      return;
    }

    try {
      console.log("File Written successfully.." + date);
      // Return a JSON response
      res.status(200).json({
        success: true,
        message: "Data Saved Successfully.",
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
});

app.delete("/api/deleteFile", (req, res) => {
  const { date } = req.query; // Access the query parameter
  var fullPath = "";
  var backupPath="";
  if (date) {
    fullPath = filePath + date;
    backupPath=filePath+"deleted/"+date
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: "Requested File Not Found",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Date query param not sent",
    });
  }

  var counter=1;
  // Check if the file already exists in the destination directory
  while (fs.existsSync(backupPath)) {
    if(path.basename(backupPath).includes("_")){
      backupPath=backupPath.substring(0,backupPath.lastIndexOf("_"))
    }
    backupPath = backupPath+`_${counter}`;
    counter++;
  }

  fs.rename(fullPath,backupPath, (e) => {
    if (e) {
      console.log(e);
    }
    console.log('file deleted successfully :: '+fullPath);
  })

  res.status(200).json({
    success: true,
    message: "file deleted successfully :: "+fullPath,
  });

})

app.get("/api/generateExcelFile",(req,res)=>{
  const { date } = req.query
  var fullPath=""
  if (date) {
    fullPath = filePath + date
    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        success: false,
        message: "File Not Found",
      });
    }

    var jsonData=fs.readFileSync(fullPath);
    

    // Step 4: Set the response headers and send the buffer
    res.setHeader('Content-Disposition', 'attachment; filename='+date+'.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(generateExcelFile(JSON.parse(jsonData)));
    return
  }

  res.status(400).json({
    success: false,
    message: "ERROR"
  });
})

function generateExcelFile(jsonData){
  
  // Create a new workbook and add a worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([])

  // Convert the date to a readable format and add it to the worksheet
  const date = new Date(jsonData.date)
  XLSX.utils.sheet_add_aoa(worksheet, [['DATE', date.toLocaleDateString()]], {origin: 'A1'})

  // Write the "Accounts" section
  XLSX.utils.sheet_add_aoa(worksheet, [['Accounts']], {origin: 'A4'})
  XLSX.utils.sheet_add_json(worksheet, jsonData.accounts, {header: ["name", "id", "amount"], origin: 'A5'})

  // Write the "Services" section
  const servicesStartRow = jsonData.accounts.length + 9
  XLSX.utils.sheet_add_aoa(worksheet, [['Services']], {origin: `A${servicesStartRow}`})
  XLSX.utils.sheet_add_json(worksheet, jsonData.services, {header: ["name", "id", "amount"], origin: `A${servicesStartRow + 1}`})

  // Write the "Customer Balance" section
  const custBalanceStartRow = servicesStartRow + jsonData.services.length + 4
  XLSX.utils.sheet_add_aoa(worksheet, [['Customer Balance']], {origin: `A${custBalanceStartRow}`})
  XLSX.utils.sheet_add_json(worksheet, jsonData.custBalance, {header: ["custName", "type", "amount"], origin: `A${custBalanceStartRow + 1}`})

  // Write the "Cash Balance" section
  const cashBalStartRow = custBalanceStartRow + jsonData.custBalance.length + 4
  XLSX.utils.sheet_add_aoa(worksheet, [['Cash Balance']], {origin: `A${cashBalStartRow}`})
  XLSX.utils.sheet_add_json(worksheet, jsonData.cashBal, {header: ["denom", "value"], origin: `A${cashBalStartRow + 1}`})

  // Write the "Today's Expenses" section
  const todayExpensesStartRow = cashBalStartRow + jsonData.cashBal.length + 4
  XLSX.utils.sheet_add_aoa(worksheet, [['Today\'s Expenses']], {origin: `A${todayExpensesStartRow}`})
  XLSX.utils.sheet_add_json(worksheet, jsonData.todayExpenses, {header: ["name", "notes", "type", "amount"], origin: `A${todayExpensesStartRow + 1}`})

  // Write the summary at the bottom
  const summaryStartRow = todayExpensesStartRow + jsonData.todayExpenses.length + 4
  XLSX.utils.sheet_add_aoa(worksheet, [
      ['Yest GT', jsonData.yestGT],
      ['Yest Diff', jsonData.yestDiff],
      ['Current GT', jsonData.currentGT],
      ['Current Diff', jsonData.currentDiff]
  ], {origin: `A${summaryStartRow}`})

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // Write the file to the disk
  //XLSX.writeFile(workbook, 'generated_sample.xlsx')
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return excelBuffer

}

function readFileSyncAsString(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (error) {
    console.error("Error reading the file:", error);
    throw error;
  }
}

function getYesterdayFileLoop(currentFileName) {
  counter = 0
  temp = getYesterdayFileName(currentFileName)
  while (counter < 730) {
    if (fs.existsSync(filePath + temp)) {
      return temp;
    } else {
      temp = getYesterdayFileName(temp)
    }
    counter++
  }
  return null
}

function getTomorrowFileLoop(currentFileName) {
  counter = 0
  temp = getTomorrowFileName(currentFileName)
  while (counter < 730) {
    if (fs.existsSync(filePath + temp)) {
      return temp;
    } else {
      temp = getTomorrowFileName(temp)
    }
    counter++
  }
  return null
}

function getYesterdayFileName(currentFileName) {
  const year = currentFileName.substring(0, 4);
  const month = currentFileName.substring(4, 6) - 1; // Months are zero-based in JavaScript, so subtract 1
  const day = currentFileName.substring(6, 8);

  let myDate = new Date();
  myDate.setFullYear(year);
  myDate.setMonth(parseInt(month));
  myDate.setDate(day);
  myDate.setDate(myDate.getDate() - 1)
  return getDateString(myDate)
}

function getTomorrowFileName(currentFileName) {
  const year = currentFileName.substring(0, 4);
  const month = currentFileName.substring(4, 6) - 1; // Months are zero-based in JavaScript, so subtract 1
  const day = currentFileName.substring(6, 8);

  let myDate = new Date();
  myDate.setFullYear(year);
  myDate.setMonth(parseInt(month));
  myDate.setDate(day);
  myDate.setDate(myDate.getDate() + 1)
  return getDateString(myDate)
}


function getDateFromString(dateStr) {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6) - 1; // Months are zero-based in JavaScript, so subtract 1
  const day = dateStr.substring(6, 8);

  let myDate = new Date();
  myDate.setFullYear(year);
  myDate.setMonth(parseInt(month));
  myDate.setDate(day);
  return myDate
}

function getDateString(mDate) {
  return `${mDate.getFullYear()}${(mDate.getMonth() + 1).toString().padStart(2, '0')}${mDate.getDate().toString().padStart(2, '0')}`
}

app.listen(3000, () => {
  console.log(new Date().toDateString() + " :: Server Is Up and Running at " + filePath);
});
