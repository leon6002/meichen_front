function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
// Function to append a new status log message
// Parameters:
//   msg: The message to be appended
//   color: The color of the message text
function addConsoleLog(msg, color) {
  const uuid = guidGenerator();
  const statusElement = document.getElementById("log-container");
  if (statusElement) {
    statusElement.innerHTML =
      `<div id="${uuid}" style="color: ${color}">${msg}</div>` +
      statusElement.innerHTML;
  }

  if (color === "red") {
    const element = document.getElementById("system-status__img");
    element.style.opacity = "100%";
    logRecord.push(uuid);
  }
  return uuid;
}

/**
 * add timed log to log console
 * @param {String} msg log message
 * @param {String} color font color
 * @param {number} timeout disapper time in ms
 */
function addTimedConsoleLog(msg, color, timeout) {
  const uuid = addConsoleLog(msg, color);
  setTimeout(() => {
    const element = document.getElementById(uuid);
    if (element) {
      element.remove();
      logRecord.splice(logRecord.indexOf(uuid));
      const imgElement = document.getElementById("system-status__img");
      if (logRecord.length > 0) {
        imgElement.style.opacity = "100%";
      } else {
        imgElement.style.opacity = "0%";
      }
    }
  }, timeout ?? 5000);
}

// Function to replace the entire status log with a new message
// Parameters:
//   msg: The message to replace the existing log
//   color: The color of the message text
function replaceStatusLog(msg, color) {
  const statusElement = document.getElementById("log-container");
  if (statusElement) {
    statusElement.innerHTML = `<div style="color: ${color}">- ${msg}</div>`;
  }
}

function update_vars_display(dataArray) {
  dataArray.forEach((item) => {
    const element = document.getElementById(`input_${item.name}`);
    if (!element || document.activeElement === element) {
      // console.log(`Element not found: input_${item.name}`);
      return; // 或者 continue; 如果希望继续处理其他元素
    }
    element.value = item.value;
  });
}

function syncInputVariableDisplay(dataArray) {
  dataArray.forEach((item) => {
    const element = document.getElementById(`input_${item.name}`);
    if (!element || document.activeElement === element) {
      // console.log(`Element not found: input_${item.name}`);
      return;
    }
    element.value = item.value;
  });
}

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

function isNumber(value) {
  return typeof value === "number";
}

function debounce(action, interval) {
  var debounceFlag;
  return function () {
    var ctx = this,
      args = arguments;
    clearTimeout(debounceFlag);
    debounceFlag = setTimeout(function () {
      console.log(action);
      action.apply(ctx, args);
    }, interval);
  };
}

function validInput(range, inputValue) {
  let max = range.max;
  let min = range.min;
  if (range.baseId) {
    const element = document.getElementById(range.baseId);
    let baseValue = parseFloat(element.value);
    if (Object.is(baseValue, NaN)) {
      baseValue = 0;
    }
    if (min !== null) {
      min += baseValue;
    }
    if (max !== null) {
      max += baseValue;
    }
  }
  const inputFloat = parseFloat(inputValue);
  if (Object.is(inputFloat, NaN)) {
    addTimedConsoleLog(`输入数字不合法：${inputValue}`, "red", 5000);
    return false;
  }
  if (max !== null) {
    if (inputValue > max) {
      addTimedConsoleLog(`输入数字超过最大值：${max}`, "red", 5000);
      return false;
    }
  }
  if (min !== null) {
    if (inputValue < min) {
      addTimedConsoleLog(`输入数字小于最小值：${min}`, "red", 5000);
      return false;
    }
  }
  return true;
}

function exportCSV(data, filename) {
  // 将数据转换为CSV格式
  let csvContent = "data:text/csv;charset=utf-8,";
  data.forEach(function (row) {
    csvContent += row.join(",") + "\n";
  });
  // 编码转换，处理中文乱码问题
  const encodedUri = encodeURI(csvContent);
  // 创建下载链接并模拟点击进行下载;
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getCurTime() {
  const date = new Date();
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function getCurTimeDash() {
  const date = new Date();
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
}
