buildChartDiv("chart-div-container");
buildDiv2Content();
buildDiv4Content();

function initStiff() {
  initInputEventListener(getManualInputs());
  startPeriodicDataFetch(needFetchVariableNames());
  // initChart(getGraphSeries());
}

function syncCustomVariableDisplay(dataArray) {
  dataArray.forEach(async (item) => {
    if (item.name === "PWM_FCE2_0_DW.Calibra_AirValve") {
      // console.log("PWM_FCE2_0_DW.Modle_control value is: ", item.value);
      const airValveInput = document.getElementById(
        "input_PWM_FCE2_0_DW.AirValve_Control"
      );
      airValveInput.disabled = item.value === 1 ? false : true;
    }
    if (item.name.startsWith("PWM_FCE2_0_DW.Manual_AirValve[")) {
      const state = await async_read_variable("PWM_FCE2_0_DW.Test_AirValve");
      // console.log("item.name is: ", item.name);
      const btn = document.getElementById(`btn_${item.name}`);
      btn.disabled = state === 1 ? false : true;
      const imgState = await async_read_variable(item.name);
      const imgElement = document.getElementById(`img_${item.name}`);
      imgElement.style.opacity = imgState === 1 ? "100%" : "0%";
    }
  });
}

function buildDiv2Content() {
  const id = "stiff-div2__stiff";
  const rows = [
    [
      {
        label: "急刹车踏板开度",
        name: "PWM_FCE2_0_DW.Emer_Brake_Pedal",
        unit: "%",
        options: {
          min: 0,
          max: 100,
          disabled: false,
        },
      },
    ],
    [
      {
        label: "急加速踏板开度",
        name: "PWM_FCE2_0_DW.Rapid_Acce_Pedal",
        unit: "%",
        options: {
          min: 0,
          max: 100,
          disabled: false,
        },
      },
    ],
    [
      {
        label: "急转弯方向盘转角（未知变量）",
        name: "unknown2",
        unit: "",
        options: {
          min: 0,
          max: 100,
          disabled: false,
        },
      },
    ],
    [
      {
        label: "急加速值",
        name: "PWM_FCE2_0_DW.Accele_Thre",
        unit: "g",
        options: {
          min: 0,
          max: 1,
          step: 0.1,
          disabled: false,
        },
      },
    ],
    [
      {
        label: "急刹车值",
        name: "PWM_FCE2_0_DW.Brake_Thre",
        unit: "g",
        options: {
          min: -1,
          max: 1,
          step: 0.1,
          disabled: false,
        },
      },
    ],
  ];
  buildLabeledInputs(id, rows);
}

function buildDiv4Content() {
  const id = "stiff-div4__air";
  const rows = [
    [
      {
        label: "启动电流对应占空比",
        name: "PWM_FCE2_0_DW.Start_Current",
        unit: "",
        options: {
          min: 0,
          max: 1,
          step: 0.1,
          fontSize: 14,
          disabled: false,
          justifyContent: "center",
        },
      },
    ],
    [
      {
        label: "保持电流对应占空比",
        name: "PWM_FCE2_0_DW.Maint_Current",
        unit: "",
        options: {
          min: 0,
          max: 1,
          step: 0.1,
          fontSize: 14,
          disabled: false,
          justifyContent: "center",
        },
      },
    ],
    [
      {
        label: "空气阀启动电流时间",
        name: "PWM_FCE2_0_DW.TimeP",
        unit: "秒",
        options: {
          fontSize: 14,
          disabled: false,
          justifyContent: "center",
        },
      },
    ],
  ];
  buildLabeledInputs(id, rows);
}

function needFetchVariableNames() {
  return [
    "PWM_FCE2_0_DW.speed",
    "PWM_FCE2_0_DW.AccelerationPedalPosition",
    "PWM_FCE2_0_DW.BrakePosition",
    "PWM_FCE2_0_DW.SteeringWheelAngle",
    "PWM_FCE2_0_DW.Emer_Brake_Pedal",
    "PWM_FCE2_0_DW.Rapid_Acce_Pedal",
    "PWM_FCE2_0_DW.Brake_Thre",
    "PWM_FCE2_0_DW.Accele_Thre",
    "PWM_FCE2_0_DW.Calibra_AirValve",
    "PWM_FCE2_0_DW.AirValve_Control",
    "PWM_FCE2_0_DW.Start_Current",
    "PWM_FCE2_0_DW.Maint_Current",
    "PWM_FCE2_0_DW.TimeP",
    "PWM_FCE2_0_DW.Test_AirValve",
    "PWM_FCE2_0_DW.Manual_AirValve[0]",
    "PWM_FCE2_0_DW.Manual_AirValve[1]",
    "PWM_FCE2_0_DW.Manual_AirValve[2]",
    "PWM_FCE2_0_DW.Manual_AirValve[3]",
    "PWM_FCE2_0_DW.Manual_AirValve[4]",
    "PWM_FCE2_0_DW.Manual_AirValve[5]",
    "PWM_FCE2_0_DW.Manual_AirValve[6]",
    "PWM_FCE2_0_DW.Manual_AirValve[7]",
  ];
}

function getManualInputs() {
  return [
    {
      name: "PWM_FCE2_0_DW.AirValve_Control",
      range: { min: 0, max: 1 },
      label: "手动控制空气阀占空比",
    },
    {
      name: "PWM_FCE2_0_DW.Start_Current",
      range: { min: 0, max: 1 },
      label: "启动电流时对应占空比",
    },
    {
      name: "PWM_FCE2_0_DW.Maint_Current",
      range: { min: 0, max: 1 },
      label: "保持电流时对应占空比",
    },
    {
      name: "PWM_FCE2_0_DW.TimeP",
      range: { min: null, max: null },
      label: "空气阀启动电流时间",
    },
    {
      name: "PWM_FCE2_0_DW.Emer_Brake_Pedal",
      range: { min: 0, max: 100 },
      label: "刹车踏板开度阈值",
    },
    {
      name: "PWM_FCE2_0_DW.Rapid_Acce_Pedal",
      range: { min: 0, max: 100 },
      label: "加速踏板开度阈值",
    },
    {
      name: "PWM_FCE2_0_DW.Brake_Thre",
      range: { min: -1, max: 1 },
      label: "急刹车加速度阈值",
    },
    {
      name: "PWM_FCE2_0_DW.Accele_Thre",
      range: { min: 0, max: 1 },
      label: "急加速加速度阈值",
    },
  ];
}

function getGraphSeries() {
  return [
    {
      id: "check1",
      label: "前悬K1",
      name: "hout[0]",
      value: 1,
      color: lineColors[0],
    },
    {
      id: "check2",
      label: "前悬K1",
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
  ];
}

async function onCalibraAirValveBtnClick() {
  // 获取所有按钮元素
  const state = await async_read_variable("PWM_FCE2_0_DW.Calibra_AirValve");
  console.log("typeof state: ", typeof state);
  console.log("state is: ", state);
  await async_write_variable(
    "PWM_FCE2_0_DW.Calibra_AirValve",
    state === 1 ? 0 : 1
  );
  const newState = await async_read_variable("PWM_FCE2_0_DW.Calibra_AirValve");
  console.log("newState is :", newState);
  const airValveInput = document.getElementById(
    "input_PWM_FCE2_0_DW.AirValve_Control"
  );
  airValveInput.disabled = newState === 1 ? false : true;
}

async function onManualAirValveBtnClick(value) {
  console.log(`btn_PWM_FCE2_0_DW.Manual_AirValve[${value}] clicked`);

  const state = await async_read_variable(
    `PWM_FCE2_0_DW.Manual_AirValve[${value}]`
  );
  console.log("typeof state: ", typeof state);
  console.log("state is: ", state);
  await async_write_variable(
    `PWM_FCE2_0_DW.Manual_AirValve[${value}]`,
    state === 1 ? 0 : 1
  );
  const newState = await async_read_variable(
    `PWM_FCE2_0_DW.Manual_AirValve[${value}]`
  );
  console.log("newState is :", newState);
  const imgElement = document.getElementById(
    `img_PWM_FCE2_0_DW.Manual_AirValve[${value}]`
  );
  imgElement.style.opacity = newState === 1 ? "100%" : "0%";
}

async function onTestAirValveBtnClick() {
  const state = await async_read_variable("PWM_FCE2_0_DW.Test_AirValve");
  console.log("typeof state: ", typeof state);
  console.log("state is: ", state);
  await async_write_variable(
    "PWM_FCE2_0_DW.Test_AirValve",
    state === 1 ? 0 : 1
  );
  const newState = await async_read_variable("PWM_FCE2_0_DW.Test_AirValve");
  console.log("newState is :", newState);
  for (let i = 0; i < 8; i++) {
    const btn = document.getElementById(
      `btn_PWM_FCE2_0_DW.Manual_AirValve[${i}]`
    );
    btn.disabled = newState === 1 ? false : true;
  }
}

$(document).ready(initStiff);
