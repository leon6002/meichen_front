buildChartDiv("chart-div-container");
buildDiv2Content();
buildDiv4Content();
buildDiv5Content();
buildDampModeSelector();

function initCDC() {
  addDampModeSelectListener();
  initInputEventListener(getManulInputs());
  startPeriodicDataFetch(needFetchVariableNames());
  initChart(getGraphSeries());
}

function syncCustomVariableDisplay(dataArray) {
  dataArray.forEach((item) => {
    if (item.name === getDampVarName()) {
      const element = document.getElementById(`select_${getDampVarName()}`);
      element.value = item.value;
    }
  });
}

function buildDiv2Content() {
  const id = "cdc-div2-container";
  const rows = [
    [
      { label: "质量", name: "Ms", unit: "", options: { disabled: false } },
      {
        label: "左前弹簧刚度",
        name: "FL_stiff",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "惯性参数Ix",
        name: "Ix",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "右前弹簧刚度",
        name: "FR_stiff",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "惯性参数Iy",
        name: "Iy",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "左后弹簧刚度",
        name: "RL_stiff",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "质心到前桥距离",
        name: "L1",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "右后弹簧刚度",
        name: "RR_stiff",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "质心到后桥距离",
        name: "L2",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "X_Acce",
        name: "Calibrat_Xacce",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "质心高度",
        name: "unknown1",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "Z_Acce",
        name: "Calibrat_Zacce",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "前防侧倾杆的侧倾刚度",
        name: "Kbar1",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "RollRate",
        name: "Calibrat_RollRate",
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "后防侧倾杆的侧倾刚度",
        name: "Kbar2",
        unit: "",
        options: { disabled: false },
      },
      {
        label: "PitchRate",
        name: "Calibrat_PitchRate",
        unit: "",
        options: { disabled: false },
      },
    ],
  ];
  buildLabeledInputs(id, rows);
}

function buildDiv4Content() {
  const ids = [
    "cdc-div4-container__standard",
    "cdc-div4-container__hard",
    "cdc-div4-container__soft",
  ];
  for (const id of ids) {
    buildLabeledInputs(id, div4ContentRows(ids.indexOf(id)));
  }
}

function div4ContentRows(mode) {
  const rows = [
    [
      {
        label: "Factor_Control",
        name: `Factor_Control[${mode}]`,
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "Prop_Control",
        name: `Prop_Control[${mode}]`,
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "Damp_Control",
        name: `Damp_Control[${mode}]`,
        unit: "",
        options: { disabled: false },
      },
    ],
    [
      {
        label: "C_Control",
        name: `C_Control[${mode}]`,
        unit: "",
        options: { disabled: false },
      },
    ],
  ];
  return rows;
}

function buildDiv5Content() {
  const imuId = "cdc-div5-container__imu";
  const imuRows = [
    [
      {
        label: "IMU_X_Acce",
        name: "IMU_XAxisDirA",
        unit: "",
        options: { disabled: true },
      },
    ],
    [
      {
        label: "IMU_Z_Acce",
        name: "IMU_ZAxisDirA",
        unit: "",
        options: { disabled: true },
      },
    ],
    [
      {
        label: "IMU_RollRate",
        name: "IMU_RollRate",
        unit: "",
        options: { disabled: true },
      },
    ],
    [
      {
        label: "IMU_PitchRate",
        name: "IMU_PitchRate",
        unit: "",
        options: { disabled: true },
      },
    ],
  ];
  buildLabeledInputs(imuId, imuRows);

  const cdcId = "cdc-div5-container__cdc";
  const cdcRows = [
    [
      {
        label: "FL_Current",
        name: "FL_current",
        unit: "",
        options: { disabled: true },
      },
      {
        label: "FL_PWM",
        name: "PWM_FL_CDC",
        unit: "",
        options: { disabled: true },
      },
    ],
    [
      {
        label: "FR_Current",
        name: "FR_current",
        unit: "",
        options: { disabled: true },
      },
      {
        label: "FR_PWM",
        name: "PWM_FR_CDC",
        unit: "",
        options: { disabled: true },
      },
    ],
    [
      {
        label: "RL_Current",
        name: "RL_current",
        unit: "",
        options: { disabled: true },
      },
      {
        label: "RL_PWM",
        name: "PWM_RL_CDC",
        unit: "",
        options: { disabled: true },
      },
    ],
    [
      {
        label: "RR_Current",
        name: "RR_current",
        unit: "",
        options: { disabled: true },
      },
      {
        label: "RR_PWM",
        name: "PWM_RR_CDC",
        unit: "",
        options: { disabled: true },
      },
    ],
  ];
  buildLabeledInputs(cdcId, cdcRows);
}

function buildDampModeSelector() {
  const dampModeId = "cdc-div3-container__damp-selector";
  const title = "阻尼模式";
  const dampModeOptions = [
    { value: 1, label: "标准模式" },
    { value: 2, label: "硬模式" },
    { value: 3, label: "软模式" },
  ];
  const el = document.getElementById(dampModeId);
  let string = `<div class="flex gap-x-2 justify-center items-center">`;
  string += `<label for="standard-select">${title}</label>`;
  string += `<div class="select">`;
  string += `<select id="select_PWM_FCE2_0_DW.Mode_Damp">`;
  for (const option of dampModeOptions) {
    string += `<option value="${option.value}">${option.label}</option>`;
  }
  string += `</select>`;
  string += `<span class="focus"></span></div></div>`;
  el.innerHTML = string;
}

function needFetchVariableNames() {
  return [
    "PWM_FCE2_0_DW.speed",
    "PWM_FCE2_0_DW.AccelerationPedalPosition",
    "PWM_FCE2_0_DW.BrakePosition",
    "PWM_FCE2_0_DW.SteeringWheelAngle",
    "PWM_FCE2_0_DW.Ms",
    "PWM_FCE2_0_DW.Ix",
    "PWM_FCE2_0_DW.Iy",
    "PWM_FCE2_0_DW.FL_stiff",
    "PWM_FCE2_0_DW.FR_stiff",
    "PWM_FCE2_0_DW.RL_stiff",
    "PWM_FCE2_0_DW.RR_stiff",
    "PWM_FCE2_0_DW.L1",
    "PWM_FCE2_0_DW.L2",
    "PWM_FCE2_0_DW.Line",
    "PWM_FCE2_0_DW.Kbar1",
    "PWM_FCE2_0_DW.Kbar2",
    "PWM_FCE2_0_DW.Calibrat_Xacce",
    "PWM_FCE2_0_DW.Calibrat_Zacce",
    "PWM_FCE2_0_DW.Calibrat_RollRate",
    "PWM_FCE2_0_DW.Calibrat_PitchRate",
    "PWM_FCE2_0_DW.Factor_Control[0]",
    "PWM_FCE2_0_DW.Factor_Control[1]",
    "PWM_FCE2_0_DW.Factor_Control[2]",
    "PWM_FCE2_0_DW.Prop_Control[0]",
    "PWM_FCE2_0_DW.Prop_Control[1]",
    "PWM_FCE2_0_DW.Prop_Control[2]",
    "PWM_FCE2_0_DW.Damp_Control[0]",
    "PWM_FCE2_0_DW.Damp_Control[1]",
    "PWM_FCE2_0_DW.Damp_Control[2]",
    "PWM_FCE2_0_DW.C_Control[0]",
    "PWM_FCE2_0_DW.C_Control[1]",
    "PWM_FCE2_0_DW.C_Control[2]",
    "PWM_FCE2_0_DW.Mode_Damp",
    "PWM_FCE2_0_DW.PWM_FL_CDC",
    "PWM_FCE2_0_DW.PWM_FR_CDC",
    "PWM_FCE2_0_DW.PWM_RL_CDC",
    "PWM_FCE2_0_DW.PWM_RR_CDC",
    "PWM_FCE2_0_DW.IMU_XAxisDirA",
    "PWM_FCE2_0_DW.IMU_ZAxisDirA",
    "PWM_FCE2_0_DW.IMU_RollRate",
    "PWM_FCE2_0_DW.IMU_PitchRate",
  ];
}

function getManulInputs() {
  return [
    {
      name: "PWM_FCE2_0_DW.Ms",
      label: "簧上质量",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Ix",
      label: "惯性参数Ix",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Iy",
      label: "惯性参数Iy",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.FL_stiff",
      label: "左前弹簧刚度",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.FR_stiff",
      label: "右前弹簧刚度",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.RL_stiff",
      label: "左后弹簧刚度",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.RR_stiff",
      label: "右后弹簧刚度",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.L1",
      label: "质心到前桥距离",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.L2",
      label: "质心到后桥距离",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Line",
      label: "左右减震器距离",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Kbar1",
      label: "前防侧倾杆的侧倾刚度",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Kbar2",
      label: "后防侧倾杆的侧倾刚度",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Calibrat_Xacce",
      label: "X_Acce标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Calibrat_Zacce",
      label: "Z_Acce标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Calibrat_RollRate",
      label: "RollRate标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Calibrat_PitchRate",
      label: "PitchRate标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Factor_Control[0]",
      label: "标准模式中Factor_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Factor_Control[1]",
      label: "硬模式中Factor_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Factor_Control[2]",
      label: "软模式中Factor_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Prop_Control[0]",
      label: "标准模式中Prop_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Prop_Control[1]",
      label: "硬模式中Prop_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Prop_Control[2]",
      label: "软模式中Prop_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Damp_Control[0]",
      label: "标准模式中Damp_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Damp_Control[1]",
      label: "硬模式中Damp_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.Damp_Control[2]",
      label: "软模式中Damp_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.C_Control[0]",
      label: "标准模式中C_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.C_Control[1]",
      label: "硬模式中C_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
    {
      name: "PWM_FCE2_0_DW.C_Control[2]",
      label: "软模式中C_Control标定参数",
      range: { min: -1000, max: 1000 },
    },
  ];
}

function getGraphSeries() {
  return [
    {
      id: "check1",
      label: "FL_Current",
      name: "FL_current",
      value: 1,
      color: lineColors[0],
    },
    {
      id: "check2",
      label: "FR_Current",
      name: "FR_current",
      value: 2,
      color: lineColors[1],
    },
    {
      id: "check3",
      label: "RL_Current",
      name: "RL_current",
      value: 3,
      color: lineColors[2],
    },
    {
      id: "check4",
      label: "RR_Current",
      name: "RR_current",
      value: 4,
      color: lineColors[3],
    },
  ];
}

let nonUserInputVars = [
  {
    name: "PWM_FCE2_0_DW.Mode_Damp",
    label: "  阻尼控制模式选择，1为标准模式，2为硬模式，3为软模式。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.FL_current",
    label: " FL_Current，输出参数，单位：A。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.FR_current",
    label: " FR_Current，输出参数，单位：A。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.RL_current",
    label: " RL_Current，输出参数，单位：A。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.RR_current",
    label: " RR_Current，输出参数，单位：A。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.PWM_FL_CDC",
    label: " FL_PWM，输出参数。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.PWM_FR_CDC",
    label: "  FR_PWM，输出参数。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.PWM_RL_CDC",
    label: "  RL_PWM，输出参数。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.PWM_RR_CDC",
    label: "  RR_PWM，输出参数。",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.IMU_XAxisDirA",
    label: "IMU_X_Acce 输出参数，单位：m/s²",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.IMU_ZAxisDirA",
    label: "输出参数，单位：m/s²",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.IMU_RollRate",
    label: "输出参数，单位：°/s",
    range: { min: -1000, max: 1000 },
  },
  {
    name: "PWM_FCE2_0_DW.IMU_PitchRate",
    label: "输出参数，单位：°/s",
    range: { min: -1000, max: 1000 },
  },
];

$(document).ready(initCDC);
