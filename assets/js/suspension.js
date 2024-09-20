function initSuspension() {
  buildChartDiv("chart-div-container");
  addHeightModeSelectListener();
  addHeightLevelButtonListener();
  addHnCalibButtonListener();
  addManualSuspensionButtonListener();
  startPeriodicDataFetch(needFetchVariableNames());
  initInputEventListener(getManulInputs());
  initChart(getGraphSeries());
}

var pressInputInterval = {
  Tank: undefined,
  FL: undefined,
  FR: undefined,
  RL: undefined,
  RR: undefined,
};

// 下面这个函数是main.js中startPeriodicDataFetch函数需要用到的函数
// 用于一些自定义的变量显示，比如下拉框变量值的展示
function syncCustomVariableDisplay(dataArray) {
  let testLeveloutCurVal = 1;
  let nomHeights = {};
  dataArray.forEach((item) => {
    if ([getHeightModeVarName()].includes(item.name)) {
      const element = document.getElementById(`select_${item.name}`);
      element.value = item.value;
    }
    if (item.name === "PWM_FCE2_0_DW.pump_relay") {
      // console.log("PWM_FCE2_0_DW.pump_relay is: ", item.value);
      const pumpRelayImg = document.getElementById(
        "img_PWM_FCE2_0_DW.pump_relay"
      );
      pumpRelayImg.style.opacity = item.value === 1 ? "100%" : "0%";
    }
    if (item.name === "PWM_FCE2_0_DW.test_levelOut") {
      // console.log("levelOut is: ", item.value);
      const testLevelOut = document.getElementById(
        `input_PWM_FCE2_0_DW.test_levelOut`
      );
      // console.log("testLevelOut", testLevelOut);
      testLevelOut.value = `H${item.value}`;
      testLeveloutCurVal = item.value - 1;
    }
    if (
      [
        "PWM_FCE2_0_DW.nom_height[0]",
        "PWM_FCE2_0_DW.nom_height[1]",
        "PWM_FCE2_0_DW.nom_height[2]",
        "PWM_FCE2_0_DW.nom_height[3]",
      ].includes(item.name)
    ) {
      nomHeights[item.name] = item.value;
    }
  });

  //更新界面右下角的4个标准高度，四个值都一样，都等于H{n}高度, 即nom_height[{n}]
  for (let i = 0; i < 4; i++) {
    const element = document.getElementById(`input_PWM_FCE2_0_DW.sdh${i}`);
    element.value =
      nomHeights[`PWM_FCE2_0_DW.nom_height[${testLeveloutCurVal}]`];
  }
  //todo 需要确认一下有默认值的那些参数在什么情况下设置默认值
}

function addHnCalibButtonListener() {
  for (let i = 1; i < 5; i++) {
    const btn = document.getElementById(`btn_PWM_FCE2_0_DW.H${i}_Calib`);
    btn.addEventListener("click", async () => {
      await saveAllHeightCalibInput();
      await async_write_variable(`PWM_FCE2_0_DW.H${i}_Calib`, 1);
      addTimedConsoleLog(`H${i}高度标定完成！`, "green", 10000);
    });
  }
}

async function saveAllHeightCalibInput() {
  for (let i = 0; i < 4; i++) {
    const inputElement = document.getElementById(
      `input_PWM_FCE2_0_DW.heigh_Input[${i}]`
    );
    const value = inputElement.value;
    await async_write_variable(`PWM_FCE2_0_DW.heigh_Input[${i}]`, value);
    addTimedConsoleLog(`heigh_Input[${i}]写入: ${value}`, "green", 10000);
  }
}

function addManualSuspensionButtonListener() {
  const heightItems = [
    { id: "FL_FR_UP", name: "PWM_FCE2_0_DW.front_axle_up", label: "前桥升" },
    {
      id: "FL_FR_DOWN",
      name: "PWM_FCE2_0_DW.front_axle_dowm",
      label: "前桥降",
    },
    { id: "RL_RR_UP", name: "PWM_FCE2_0_DW.rear_axle_up", label: "后桥升" },
    { id: "RL_RR_DOWN", name: "PWM_FCE2_0_DW.rear_axle_dowm", label: "后桥降" },
    { id: "FL_UP", name: "PWM_FCE2_0_DW.FL_up", label: "左前升" },
    { id: "FL_DOWN", name: "PWM_FCE2_0_DW.FL_down", label: "左前降" },
    { id: "FR_UP", name: "PWM_FCE2_0_DW.FR_up", label: "右前升" },
    { id: "FR_DOWN", name: "PWM_FCE2_0_DW.FR_down", label: "右前降" },
    { id: "RL_UP", name: "PWM_FCE2_0_DW.RL_up", label: "左后升" },
    { id: "RL_DOWN", name: "PWM_FCE2_0_DW.RL_down", label: "左后降" },
    { id: "RR_UP", name: "PWM_FCE2_0_DW.RR_up", label: "右后升" },
    { id: "RR_DOWN", name: "PWM_FCE2_0_DW.RR_down", label: "右后降" },
  ];
  heightItems.forEach((heightItem) => {
    addHeightControlButtonListener(heightItem.id, heightItem);
  });
  addFullHeightControlListener("up");
  addFullHeightControlListener("down");
}

function addHeightControlButtonListener(elementId, heightItem) {
  const btn = document.getElementById(elementId);
  let imgIds = [];
  heightItem.id
    .replace("_UP", "")
    .replace("_DOWN", "")
    .split("_")
    .forEach((item) => {
      imgIds.push(`${item}-height-img`);
    });
  btn.addEventListener("mousedown", function () {
    console.log(`imgIds: `, imgIds);
    onHeightBtnAction(heightItem.name, 1, imgIds);
  });
  btn.addEventListener("mouseup", function () {
    onHeightBtnAction(heightItem.name, 0, imgIds);
  });
}

function addFullHeightControlListener(action) {
  const btn = document.getElementById(`all_${action}`);
  const rearImgIds = ["RL-height-img", "RR-height-img"];
  const frontImgIds = ["FL-height-img", "FR-height-img"];
  btn.addEventListener("mousedown", function () {
    onHeightBtnAction(`PWM_FCE2_0_DW.rear_axle_${action}`, 1, rearImgIds);
    onHeightBtnAction(`PWM_FCE2_0_DW.front_axle_${action}`, 1, frontImgIds);
  });
  btn.addEventListener("mouseup", function () {
    onHeightBtnAction(`PWM_FCE2_0_DW.rear_axle_${action}`, 0, rearImgIds);
    onHeightBtnAction(`PWM_FCE2_0_DW.front_axle_${action}`, 0, frontImgIds);
  });
}

async function onManualControlBtnClick() {
  const buttonVarName = "PWM_FCE2_0_DW.manual_control";
  //先读一遍
  const stateBefore = await async_read_variable(buttonVarName);
  console.log(`${buttonVarName} stateBefore: `, stateBefore);
  await async_write_variable(buttonVarName, stateBefore === 1 ? 0 : 1);
  //再读一遍
  const stateAfter = await async_read_variable(buttonVarName);
  console.log(`${buttonVarName} stateAfter: `, stateAfter);
  addTimedConsoleLog(
    `${stateAfter === 1 ? "已开启" : "已关闭"}手动控制空气弹簧系统`,
    "green"
  );
  //修改相关所有button的disabled状态
  const heightControlWrapper = document.getElementById(
    "height_control_wrapper"
  );
  const heightControlButtons = heightControlWrapper.querySelectorAll("button");
  heightControlButtons.forEach(function (button) {
    button.disabled = stateAfter === 0;
  });
  //修改当前按钮文本
  const buttonTextEl = document.getElementById(
    "sus-manual-control-button-text"
  );
  buttonTextEl.innerHTML = `${
    stateAfter === 0 ? "开启" : "关闭"
  }手动控制空气弹簧系统`;
}

async function onAerateTankButtonClick() {
  const aerateTankVarName = "PWM_FCE2_0_DW.Aerate_Tank";
  //先读一遍
  const stateBefore = await async_read_variable(aerateTankVarName);
  console.log(`${aerateTankVarName} stateBefore: `, stateBefore);
  //修改
  await async_write_variable(aerateTankVarName, stateBefore === 1 ? 0 : 1);
  //再读一遍
  const stateAfter = await async_read_variable(aerateTankVarName);
  console.log(`${aerateTankVarName} stateAfter: `, stateAfter);
  addTimedConsoleLog(
    `储气罐充气已${stateAfter === 1 ? "开始" : "结束"}`,
    "green"
  );
}

async function onDetectTank(value) {
  // 获取所有按钮元素
  const state = await async_read_variable(`PWM_FCE2_0_DW.Detect_${value}`);
  console.log("state is: ", state);
  await async_write_variable(
    `PWM_FCE2_0_DW.Detect_${value}`,
    state === 1 ? 0 : 1
  );
  const newState = await async_read_variable(`PWM_FCE2_0_DW.Detect_${value}`);
  console.log("new state is: ", newState);
  const detectIng = document.getElementById("img_Detect_" + value);
  detectIng.style.opacity = newState === 1 ? "100%" : "0%";
  const label = {
    FL: "左前",
    FR: "右前",
    RL: "左后",
    RR: "右后",
    Tank: "储气罐",
  };
  const valueLabel = label[value];
  const inputElement = document.getElementById(
    `input_PWM_FCE2_0_DW.Press_${value}`
  );

  if (newState === 1) {
    //开始更新input值
    pressInputInterval[value] = setInterval(
      () => {
        updateInputdisplay(`PWM_FCE2_0_DW.Press_${value}`, inputElement);
      },

      dataFetchRate
    );
    console.log(
      "interval is:",
      pressInputInterval[value],
      `PWM_FCE2_0_DW.Press_${value}`
    );
  } else {
    if (pressInputInterval[value]) {
      clearInterval(pressInputInterval[value]);
      pressInputInterval[value] = undefined;
    }
    setTimeout(() => {
      inputElement.value = "";
    }, 300);
  }
  addTimedConsoleLog(
    newState === 1 ? `${valueLabel}气压检测开始` : `${valueLabel}气压检测结束`,
    "green",
    5000
  );
}

async function updateInputdisplay(varName, inputElement) {
  // console.log("updateInputdisplay: ", varName, inputElement);
  // const inputElement = document.getElementById(inputId);
  async_read_variable(varName).then((res) => {
    inputElement.value = res;
  });
}

function onHeightBtnAction(name, val, elementIds) {
  let opacity = val === 1 ? "100" : "0";
  pcm
    .WriteVariable(name, val)
    .then(() => {
      console.log(`Write of the ${name} with value ${val} succeeded.`);
      elementIds.forEach((item) => {
        const element = document.getElementById(item);
        element.style.opacity = opacity;
      });
    })
    .catch((err) => {
      on_error(err.msg);
    });
}

function needFetchVariableNames() {
  return [
    "PWM_FCE2_0_DW.speed",
    "PWM_FCE2_0_DW.AccelerationPedalPosition",
    "PWM_FCE2_0_DW.BrakePosition",
    "PWM_FCE2_0_DW.SteeringWheelAngle",
    "PWM_FCE2_0_DW.X_Acce",
    "PWM_FCE2_0_DW.pump_relay",
    "PWM_FCE2_0_DW.TempSensor",
    "PWM_FCE2_0_DW.manual_control",
    "PWM_FCE2_0_DW.front_axle_up",
    "PWM_FCE2_0_DW.front_axle_dowm",
    "PWM_FCE2_0_DW.rear_axle_up",
    "PWM_FCE2_0_DW.rear_axle_dowm",
    "PWM_FCE2_0_DW.FL_up",
    "PWM_FCE2_0_DW.FL_down",
    "PWM_FCE2_0_DW.FR_up",
    "PWM_FCE2_0_DW.FR_down",
    "PWM_FCE2_0_DW.RL_up",
    "PWM_FCE2_0_DW.RL_down",
    "PWM_FCE2_0_DW.RR_up",
    "PWM_FCE2_0_DW.RR_down",
    "PWM_FCE2_0_DW.Detect_Tank",
    "PWM_FCE2_0_DW.Detect_FL",
    "PWM_FCE2_0_DW.Detect_FR",
    "PWM_FCE2_0_DW.Detect_RL",
    "PWM_FCE2_0_DW.Detect_RR",
    "PWM_FCE2_0_DW.nom_height[0]",
    "PWM_FCE2_0_DW.nom_height[1]",
    "PWM_FCE2_0_DW.nom_height[2]",
    "PWM_FCE2_0_DW.nom_height[3]",
    "PWM_FCE2_0_DW.Devia",
    "PWM_FCE2_0_DW.Redund",
    "PWM_FCE2_0_DW.L_pressure",
    "PWM_FCE2_0_DW.H_pressure",
    "PWM_FCE2_0_DW.Level1",
    "PWM_FCE2_0_DW.Level2",
    "PWM_FCE2_0_DW.Level3",
    "PWM_FCE2_0_DW.Level4",
    "PWM_FCE2_0_DW.Modle_control",
    "PWM_FCE2_0_DW.test_levelOut",
    "PWM_FCE2_0_DW.hout[0]",
    "PWM_FCE2_0_DW.hout[1]",
    "PWM_FCE2_0_DW.hout[2]",
    "PWM_FCE2_0_DW.hout[3]",
  ];
}

function getGraphSeries() {
  return [
    {
      id: "check1",
      label: "左前高度",
      name: "hout[0]",
      value: 1,
      color: lineColors[0],
    },
    {
      id: "check2",
      label: "右前高度",
      name: "hout[1]",
      value: 2,
      color: lineColors[1],
    },
    {
      id: "check3",
      label: "右前高度",
      name: "hout[2]",
      value: 3,
      color: lineColors[2],
    },
    {
      id: "check4",
      label: "右前高度",
      name: "hout[3]",
      value: 4,
      color: lineColors[3],
    },
    // ...更多项目
  ];
}

function getManulInputs() {
  return [
    {
      name: "PWM_FCE2_0_DW.nom_height[0]",
      range: { min: null, max: null },
      label: "H1标准高度",
    },
    {
      name: "PWM_FCE2_0_DW.nom_height[1]",
      range: { min: null, max: null },
      label: "H2标准高度",
    },
    {
      name: "PWM_FCE2_0_DW.nom_height[2]",
      range: { min: null, max: null },
      label: "H3标准高度",
    },
    {
      name: "PWM_FCE2_0_DW.nom_height[3]",
      range: { min: null, max: null },
      label: "H4标准高度",
    },
    {
      name: "PWM_FCE2_0_DW.height_auxil",
      range: { min: -20, max: 0, baseId: "input_PWM_FCE2_0_DW.nom_height[0]" },
      label: "辅助功能高度",
    },
    {
      name: "PWM_FCE2_0_DW.Devia",
      range: { min: null, max: null },
      label: "空气弹簧高度变化冗余度",
    },
    {
      name: "PWM_FCE2_0_DW.Redund",
      range: { min: null, max: null },
      label: "车身高度调整偏差",
    },
    {
      name: "PWM_FCE2_0_DW.L_pressure",
      range: { min: null, max: null },
      label: "储气罐补气阈值",
    },
    {
      name: "PWM_FCE2_0_DW.H_pressure",
      range: { min: null, max: null },
      label: "储气罐停止补气阈值",
    },
  ];
}

// TODO: 需要设置默认值的变量？
const resetDefaultVariables = [
  { name: "PWM_FCE2_0_DW.Devia", value: 5 },
  { name: "PWM_FCE2_0_DW.Redund", value: 1 },
  { name: "PWM_FCE2_0_DW.L_pressure", value: 0.5 },
  { name: "PWM_FCE2_0_DW.H_pressure", value: 0.8 },
];

const nonUpdateVars = [
  "PWM_FCE2_0_DW.Press_Tank",
  "PWM_FCE2_0_DW.Press_FL",
  "PWM_FCE2_0_DW.Press_FR",
  "PWM_FCE2_0_DW.Press_RL",
  "PWM_FCE2_0_DW.Press_RR",
  "PWM_FCE2_0_DW.heigh_Input[0]",
  "PWM_FCE2_0_DW.heigh_Input[1]",
  "PWM_FCE2_0_DW.heigh_Input[2]",
  "PWM_FCE2_0_DW.heigh_Input[3]",
  "PWM_FCE2_0_DW.H1_Calib",
  "PWM_FCE2_0_DW.H2_Calib",
  "PWM_FCE2_0_DW.H3_Calib",
  "PWM_FCE2_0_DW.H4_Calib",
];

$(document).ready(initSuspension);
