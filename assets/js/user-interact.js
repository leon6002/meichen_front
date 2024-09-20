function initUserInteract() {
  addDampModeSelectListener();
  addHeightModeSelectListener();
  startPeriodicDataFetch(needFetchVariableNames());
  onLevelHeightBtnChange();
}

// 下面这个函数是main.js中startPeriodicDataFetch函数需要用到的函数
// 用于一些自定义的变量显示，比如下拉框变量值的展示
function syncCustomVariableDisplay(dataArray) {
  dataArray.forEach((item) => {
    if ([getDampVarName(), getHeightModeVarName()].includes(item.name)) {
      const element = document.getElementById(`select_${item.name}`);
      element.value = item.value;
    }
  });
}

async function onModeUserBtnClick() {
  // 获取所有按钮元素
  const state = await async_read_variable("PWM_FCE2_0_DW.Modle_usher");
  console.log("typeof state: ", typeof state);
  console.log("state is: ", state);
  await async_write_variable("PWM_FCE2_0_DW.Modle_usher", state === 1 ? 0 : 1);
  addTimedConsoleLog(
    state === 1 ? "便捷上下车已关闭" : "便捷上下车已开启",
    "green",
    5000
  );
}

async function onModeLoadBtnClick() {
  // 获取所有按钮元素
  const state = await async_read_variable("PWM_FCE2_0_DW.Mode_Load");
  console.log("typeof state: ", typeof state);
  console.log("state is: ", state);
  await async_write_variable("PWM_FCE2_0_DW.Mode_Load", state === 1 ? 0 : 1);
  addTimedConsoleLog(
    state === 1 ? "便捷载物已关闭" : "便捷载物已开启",
    "green"
  );
}

async function onServiceBtnClick(isOpen) {
  await async_write_variable("PWM_FCE2_0_DW.ServiceOn", isOpen ? 1 : 0);
  await async_write_variable("PWM_FCE2_0_DW.ServiceOff", isOpen ? 0 : 1);
  addTimedConsoleLog(
    isOpen ? "维修模式已开启！" : "维修模式已关闭！",
    "green",
    5000
  );
}

async function onJackBtnClick(isOpen) {
  await async_write_variable("PWM_FCE2_0_DW.JackOn", isOpen ? 1 : 0);
  await async_write_variable("PWM_FCE2_0_DW.JackOff", isOpen ? 0 : 1);
  addTimedConsoleLog(
    isOpen ? "千斤顶模式已开启！" : "千斤顶模式已关闭！",
    "green",
    5000
  );
}

// async function read_all_ui_variables() {
//   const variable_list = get_ui_variables();
//   resDataString = await async_read_multiple_variables(variable_list);
//   const resDataObj = JSON.parse(resDataString);
//   return resDataObj;
// }

// async function read_and_upate_all_ui_vars() {
//   if (!pcmConnected) {
//     return;
//   }
//   const vars = await read_all_ui_variables();
//   update_ui_select(vars);
//   // console.log("ui vars get success");
//   update_vars_display(vars);
// }

// function update_ui_select(vars) {
//   for (const item of vars) {

//   }
// }

// function initUserInteract() {
//   setInterval(read_and_upate_all_ui_vars, 1000);
// }

// initUserInteract();

var checkedValues = [];
var csvData = [["时间", "变量名", "变量值"]];

function onLevelHeightBtnChange() {
  for (let i = 1; i < 5; i++) {
    const btn = document.getElementById(`btn_PWM_FCE2_0_DW.Level${i}`);
    // console.log("adding ", btn);
    // btn.addEventListener("mousedown", function () {
    //   onLevelHeightBtnAction(i, 1);
    // });
    // btn.addEventListener("mouseup", function () {
    //   onLevelHeightBtnAction(i, 0);
    // });
    //todo: 确认这里的逻辑，是否是按下放开
    btn.addEventListener("click", function () {
      onLevelHeightBtnAction(i);
    });
  }
}

async function onLevelHeightBtnAction(level) {
  for (let i = 1; i < 5; i++) {
    if (level === i) {
      await async_write_variable(`PWM_FCE2_0_DW.Level${level}`, 1);
    } else {
      await async_write_variable(`PWM_FCE2_0_DW.Level${level}`, 0);
    }
  }
  addTimedConsoleLog(`高度等级设置为：H${level}高度`, "green", 5000);
}

async function onSaveStartBtnClick() {
  //开始事件
  const resEnabel = await pcm.EnableEvents(true);
  console.log("resEnabel, ", resEnabel);
  pcm.OnVariableChanged = variableChangedHandler;
  let checkboxes = document.querySelectorAll("#checkbox-group input:checked");
  if (checkboxes.length <= 0) {
    addTimedConsoleLog("至少勾选一个变量", "red", 8000);
    return;
  }
  let values = [];
  csvData = [["时间", "变量名", "变量值"]];
  checkboxes.forEach((checkbox) => {
    values.push(checkbox.value);
  });
  checkedValues = values;
  console.log("save start", checkedValues);
  checkedValues.forEach((item) => {
    pcm
      .SubscribeVariable(item, 100)
      .then((res) => {
        console.log(res);
        addTimedConsoleLog(`订阅变量成功：[${item}]`, "green", 5000);
      })
      .catch((err) => {
        console.log("订阅变量失败: ", item, err);
        addTimedConsoleLog(`订阅变量失败：[${item}]`, "red", 8000);
      });
  });
  const allCheckboxs = document.querySelectorAll("#checkbox-group input");
  allCheckboxs.forEach((item) => (item.disabled = true));
  const checkboxbtns = document.querySelectorAll(
    "#checkbox-select-all-container button"
  );
  checkboxbtns.forEach((item) => (item.disabled = true));
  const startbtn = document.getElementById("btn_start_save");
  startbtn.disabled = true;
}

function variableChangedHandler(name, id, value) {
  let time = getCurTime();
  csvData.push([time, name, value]);
}

function onSaveEndBtnClick() {
  if (csvData.length <= 1) {
    addTimedConsoleLog("请先点击开【保存开始】按钮", "red", 8000);
    return;
  }
  exportCSV(csvData, `数据导出${getCurTimeDash().split("-").join("")}`);
  checkedValues.forEach((name) => {
    pcm.UnSubscribeVariable(name);
  });
  const allCheckboxs = document.querySelectorAll("#checkbox-group input");
  allCheckboxs.forEach((item) => (item.disabled = false));
  const checkboxbtns = document.querySelectorAll(
    "#checkbox-select-all-container button"
  );
  checkboxbtns.forEach((item) => (item.disabled = false));
  const startbtn = document.getElementById("btn_start_save");
  startbtn.disabled = false;
  csvData = [["时间", "变量名", "变量值"]];
}

function onSelectAllBtnClick(selectAll) {
  let checkboxes = document.querySelectorAll("#checkbox-group input");
  console.log("checkboxes", checkboxes);
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll;
  });
}

function needFetchVariableNames() {
  return [
    "PWM_FCE2_0_DW.Modle_control",
    "PWM_FCE2_0_DW.Mode_Damp",
    "PWM_FCE2_0_DW.speed",
    "PWM_FCE2_0_DW.AccelerationPedalPosition",
    "PWM_FCE2_0_DW.BrakePosition",
    "PWM_FCE2_0_DW.SteeringWheelAngle",
  ];
}

$(document).ready(initUserInteract);
