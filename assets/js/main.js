var pcm; // the main FreeMASTER communication object
var pcmConnected = false;
var itemsData;
var data;
var chartView;
var chart;
var options;
//图表数据周期
const fetchRate = 100;
//其余数据周期
const dataFetchRate = 100;
const maxRows = 30;
var showColumns = [0, 1, 2, 3, 4];
var lineColors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
var logRecord = [];

// --------------------- 接收index.html传入到当前页面的消息 ---------------------
window.onload = function () {
  window.addEventListener("message", function (e) {
    iframeReceiveData(e.data);
  });
};
const iframeReceiveData = async (data) => {
  if (!pcm) {
    try {
      initPCM();
    } catch (err) {
      console.log(err);
    }
    if (!pcm) {
      addConsoleLog("pcm初始化失败，连接41000端口", "red");
      return;
    }
    console.log("readyState: ", pcm._socket.readyState);
    if (pcm._socket.readyState !== 1) {
      addConsoleLog("pcm初始化失败，未连接41000端口", "red");
      return;
    }
    pcmConnected = true;
  }
  console.log("iframeReceiveData: data is:", data);
  if (data === "start") {
    await handleStartSystem();
  }

  if (data === "stop") {
    const stopRes = await pcm.StopComm();
    console.log("stop res is: ", stopRes);
    const IsCommPortOpenAgain = await pcm.IsCommPortOpen();
    console.log("IsCommPortOpenAgain: ", IsCommPortOpenAgain);
    addConsoleLog("系统已停止", "green");
  }
};
// ---------------------------------------------------------------------------

// --------------------- 初始化pcm，建立websocket连接 ---------------------
function initPCM() {
  if (pcm !== undefined) {
    console.log("pcm already exists");
    return;
  }
  /* Desktop FreeMASTER listens on port 41000 by default, unless this is
     * overridden on command line using /rpcs option. FreeMASTER Lite 
     is configurable. */

  // default address
  // var rpcs_addr = "localhost:41001";
  var rpcs_addr = "wss://fm.guliucang.com/ws";

  // freemaster 3.1.3 and above provides the info about itself:
  if (typeof FreeMASTER != "undefined") {
    rpcs_addr = FreeMASTER.rpcs_addr;

    // also provide some information about this session
    fmstr_info.innerHTML =
      "FreeMASTER version: " +
      FreeMASTER.version +
      "<br>" +
      "JSON-RPC server address: " +
      FreeMASTER.rpcs_addr +
      "<br>";
  }

  pcm = new PCM(rpcs_addr, on_connected, on_error, on_error);
  pcm.OnServerError = on_error;
  pcm.OnSocketError = on_error;
  console.log("initPCM pcm is: ", pcm);
}

function on_connected() {
  /* Typically, you want to enable extra features to make use of the full API
   * provided by desktop application. Leave this disabled and avoid any extra
   * features when creating pages compatible with FreeMASTER Lite. */
  //pcm.EnableExtraFeatures(true);
  window.parent.postMessage("connected", "*");
  addTimedConsoleLog("freemaster websocket连接成功", "green", 5000);
  pcmConnected = true;
  handleStartSystem();

  // $("communication-signal-image").classList.remove("filter-grey");
}

function on_error(err) {
  /* Erors are reported in the status field. */
  //   document.getElementById("status").innerHTML = err;
  const signalImg = document.getElementById("communication-signal-image");
  if (signalImg) {
    signalImg.style.filter = "grayscale(100%)";
  }
  console.log(err);
  if (err.type && err.type === "error") {
    addConsoleLog("与freemaster websocket通信连接失败", "red");
  }
  if (err.type && err.type === "close") {
    addConsoleLog("与freemaster websocket通信连接已关闭", "red");
  }
  pcmConnected = false;
  window.parent.postMessage("ended", "*");
}
// -------------------------------------------------

//系统启动按钮
async function handleStartSystem() {
  // 检查是否已经启动
  // const isOpen = portOpenCheck();
  // if (isOpen) return;

  console.log("startCommiuncation");
  let portName = await tryPort(10);
  if (portName === null) {
    console.log("tryPort error!");
    addConsoleLog("连接失败：未检测到端口", "red");
    return;
  }
  try {
    const startCommResResult = await pcm.StartComm(portName);
    console.log("startCommResResult is ", startCommResResult);
    if (startCommResResult.success && startCommResResult.xtra.retval) {
      // console.log("startCommRes success");
      addTimedConsoleLog("startComm成功", "green", 5000);
    } else {
      // console.log("startCommRes error, res is: ", startCommResResult.error.msg);
      addConsoleLog(`连接失败: ${startCommResResult.error.msg}`, "red");
      return;
    }
  } catch (err) {
    console.log("error catched", err);
    console.log(
      `startCommRes error, res is: code: ${err.code}, msg: ${err.msg}}`
    );
    addConsoleLog(`连接失败: ${err.msg}`, "red");
    return;
  }
  isOpen = portOpenCheck();
  if (!isOpen) return;

  addConsoleLog("系统正常", "green");
}

async function portOpenCheck() {
  const openCheck = await pcm.IsCommPortOpen();
  if (openCheck.data) {
    console.log("CommPort is open");
    addTimedConsoleLog("CommPort已连接", "green");
    return true;
  }
  console.log("Error: CommPort is not open");
  addConsoleLog("CommPort未打开", "red");
  return false;
}

async function tryPort(maxIndex) {
  let index = 0;
  do {
    try {
      console.log("trying port: ", index);
      let response = await pcm.EnumCommPorts(index);
      return response.data;
    } catch (err) {
      console.log(err);
    }
    index = index + 1;
    if (index > maxIndex) {
      return null;
    }
  } while (true);
}

async function async_read_variable(name) {
  /* ReadVariable uses FreeMASTER variable object from current project. Use
   * ReadUIntVariable to access the memory directly using a symbol name. */
  const res = await pcm.ReadVariable(name);
  // console.log("resdata is:", res.data);
  return res.data;
}

async function async_read_multiple_variables(name) {
  /* ReadVariable uses FreeMASTER variable object from current project. Use
   * ReadUIntVariable to access the memory directly using a symbol name. */
  const res = await pcm.ReadMultipleVariables(name);
  // console.log("resdata is:", res.data);
  return res.data;
}

function read_array(name, elemSize, length, span_id) {
  /* Arrays are accessed in memory directly, using a symbol name and element size.  */
  pcm
    .ReadUIntArray(name, length, elemSize)
    .then((value) => {
      document.getElementById(span_id).innerHTML = "";
      for (i = 0; i < value.data.length; i++)
        document.getElementById(span_id).innerHTML +=
          " " + value.data[i].toString(16);
    })
    .catch((err) => {
      on_error(err.msg);
    });
}

async function async_write_variable(name, value) {
  const result = await pcm.WriteVariable(name, value);
  console.log(`write(${name}, ${value}) => `, result);
  if (result.success) {
    return true;
  }
  return false;
}

async function writeVariableWithLog(name, value, message) {
  const result = await pcm.WriteVariable(name, value);
  if (result.success) {
    addTimedConsoleLog(`【${message}】成功输入：${value}`, "green", 5000);
    return true;
  }
  addTimedConsoleLog(`【${message}】输入${value}失败!`, "red", 8000);
  return false;
}

//  -------------------------------  图表相关 -----------------------------------

function initChart(itemsData) {
  console.log("start drawing chart");
  this.itemsData = itemsData;
  console.log("this.itemsData", this.itemsData);
  // $(document).ready(function () {
  console.log("document ready");
  const $overlayContainer = $("#chatOverlayWrapper");

  itemsData.forEach((item) => {
    const $overlayItem = $("<div>").addClass("overlay__item");
    const $input = $("<input>")
      .attr({
        type: "checkbox",
        id: item.id,
        name: "series",
        value: item.value,
        checked: "true",
      })
      .addClass("check")
      .change((event) => onChangeCheckbox(event.target));

    const $label = $("<label>").text(item.label);
    const $div = $("<div>").css("background-color", "black");
    // console.log("item color is: ", item.color);
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`;
    const svgDoc = $.parseXML(svgString);
    const $svg = $(svgDoc).find("svg");
    $div.append($svg);
    $overlayItem.append($input, $label, $div);
    $overlayContainer.append($overlayItem);
  });
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);
}

function onChangeCheckbox(checkbox) {
  if (!checkbox) {
    return;
  }
  console.log(`Checkbox ${checkbox.id} changed to ${checkbox.checked}`);
  showColumns = [0];
  itemsData.forEach((item, index) => {
    var checkboxItem = document.getElementById(item.id);
    console.log(`checkbox ${item.id} is ${checkboxItem.checked}`);
    if (checkboxItem.checked) {
      showColumns.push(item.value);
    }
  });
  if (showColumns.length <= 1) {
    alert("至少选择一个变量展示");
    checkbox.checked = true;
    return;
  }
  (options.series = {
    0: {
      color: lineColors[showColumns[1] - 1],
    },
    1: {
      color: lineColors[showColumns[2] - 1],
    },
    2: {
      color: lineColors[showColumns[3] - 1],
    },
    3: {
      color: lineColors[showColumns[4] - 1],
    },
  }),
    chartView.setColumns(showColumns);
}

function drawChart() {
  data = new google.visualization.DataTable();
  data.addColumn("date", "Time");
  itemsData.forEach(function (item) {
    data.addColumn("number", item.name);
  });

  chart = new google.visualization.LineChart(
    document.getElementById("chart_div")
  );

  chartView = new google.visualization.DataView(data);

  options = {
    title: "",
    smoothLine: true,
    hAxis: {
      format: "hh:mm:ss",
      gridlines: { count: 5 },
      textStyle: { color: "grey", fontSize: "10" },
    },
    vAxis: {
      gridlines: { count: 5 },
      textStyle: { color: "grey", fontSize: "10" },
    },
    legend: { position: "none" },
    backgroundColor: { fill: "transparent" },
    chartArea: {
      backgroundColor: "black",
      left: 50,
      top: 10,
      width: "90%",
      height: "90%",
    },
    fontSize: "10px",
    series: {
      0: {
        color: lineColors[showColumns[1] - 1],
      },
      1: {
        color: lineColors[showColumns[2] - 1],
      },
      2: {
        color: lineColors[showColumns[3] - 1],
      },
      3: {
        color: lineColors[showColumns[4] - 1],
      },
    },
  };

  // set up the position of ther overlay object
  function placeMarker() {
    var cli = this.getChartLayoutInterface();
    var chartArea = cli.getChartAreaBoundingBox();
    document.querySelector(".overlay").style.top = chartArea.top + "px";
    document.querySelector(".overlay").style.left = chartArea.left + "px";
  }

  google.visualization.events.addListener(
    chart,
    "ready",
    placeMarker.bind(chart, data)
  );

  intervalId = setInterval(drawChartInterval, fetchRate);
}

async function drawChartInterval() {
  try {
    if (!pcmConnected) {
      return;
    }
    var date = new Date();
    let rows = [date];
    // console.log("itemsData is: ");
    // console.log(itemsData);
    let namesArray = itemsData.map((item) => {
      return `PWM_FCE2_0_DW.${item.name}`;
    });
    // console.log(namesArray);
    const resDataString = await async_read_multiple_variables(namesArray);
    let resDataObj = JSON.parse(resDataString);
    update_vars_display(resDataObj);
    const obj = extractResData(resDataObj);
    // console.log("obj: ", obj);
    itemsData.forEach((item) => {
      rows.push(obj[`PWM_FCE2_0_DW.${item.name}`]);
    });
    // console.log("rows is: ", rows);
    data.addRow(rows);

    if (data.getNumberOfRows() > maxRows) {
      data.removeRow(0);
    }

    chart.draw(chartView, options);
  } catch (err) {
    console.log("get variable failed");
    return;
  }
}

function extractResData(resDataObj) {
  return resDataObj.reduce((accumulator, currentItem) => {
    accumulator[currentItem.name] = currentItem.value;
    return accumulator;
  }, {});
}

function onCarInputButton() {
  const inputs = document.querySelectorAll("#sys-info-input-group input");
  inputs.forEach(function (input) {
    input.disabled = !input.disabled;
  });
}
//  -----------------------------------------------------------------------------

// -------------------- 定时拉取变量值并更新的对应的元素上，此方法只在对应页面的js中调用，不在此js调用 --------------------
function startPeriodicDataFetch(variableNames) {
  setInterval(() => {
    fetchAndUpdateVariablesDisplay(variableNames);
  }, dataFetchRate);
}

async function fetchAndUpdateVariablesDisplay(variableNames) {
  if (!pcmConnected) return;
  try {
    const resDataString = await async_read_multiple_variables(variableNames);
    const dataArray = JSON.parse(resDataString);
    syncInputVariableDisplay(dataArray);
    syncCustomVariableDisplay(dataArray);
  } catch (error) {
    console.error("Error fetching and updating variables:", error);
  }
}
// --------------------------------------------------------------------------------------------------------------

// ----- cdc阻尼调试页面中的‘阻尼模式’下拉框 和 用户操作页面的‘悬架软硬’下拉框 -----
function getDampVarName() {
  return "PWM_FCE2_0_DW.Mode_Damp";
}

function addDampModeSelectListener() {
  const el = document.getElementById(`select_${getDampVarName()}`);
  el.addEventListener("change", (event) => {
    handleDampModeChange(event.target.value);
  });
}

async function handleDampModeChange(value) {
  valueMap = ["标准模式", "硬模式", "软模式"];
  try {
    await async_write_variable(getDampVarName(), value);
    addTimedConsoleLog(
      `悬架软硬模式成功切换为: ${valueMap[value - 1]}`,
      "green"
    );
  } catch (err) {
    console.log(err);
    addTimedConsoleLog(`悬架软硬模式切换失败：${valueMap[value - 1]}`, "red");
  }
}
// -----------------------------------------------------------------------

// ----- 悬架页面中的‘高度模式’下拉框 和 用户操作页面的‘高度模式’下拉框 -----
function getHeightModeVarName() {
  return "PWM_FCE2_0_DW.Modle_control";
}

function addHeightModeSelectListener() {
  const el = document.getElementById(`select_${getHeightModeVarName()}`);
  el.addEventListener("change", (event) => {
    handleHeightModeChange(event.target.value);
  });
}

async function handleHeightModeChange(value) {
  valueMap = ["标准模式", "运动模式", "越野模式"];
  try {
    await async_write_variable(getHeightModeVarName(), value);
    addTimedConsoleLog(`高度模式成功切换为: ${valueMap[value - 1]}`, "green");
  } catch (err) {
    console.log(err);
    addTimedConsoleLog(`高度模式切换失败：${valueMap[value - 1]}`, "red");
  }
}
// ------------------------------------------------------------------

// ----- 悬架页面中的H1234高度按钮 和 用户操作页面的H1234高度按钮 -----

function addHeightLevelButtonListener() {
  for (let i = 1; i < 5; i++) {
    const btn = document.getElementById(`btn_PWM_FCE2_0_DW.Level${i}`);
    //todo: 确认这里的逻辑，是否是按下放开
    btn.addEventListener("click", function () {
      handleHeightLevelButtonClick(i);
    });
  }
}

async function handleHeightLevelButtonClick(level) {
  //TODO: 需确认是否一个button按下的时候，其他3个button都输入0， 当前button输入1
  for (let i = 1; i < 5; i++) {
    if (level === i) {
      await async_write_variable(`PWM_FCE2_0_DW.Level${level}`, 1);
    } else {
      await async_write_variable(`PWM_FCE2_0_DW.Level${level}`, 0);
    }
  }
  addTimedConsoleLog(`高度等级设置为：H${level}高度`, "green");
}
// ------------------------------------------------------------------

// ------------------------ 获取并处理warning相关变量 ------------------------
function get_warning_vars() {
  return [
    "PWM_FCE2_0_DW.heighWarn[0]",
    "PWM_FCE2_0_DW.heighWarn[1]",
    "PWM_FCE2_0_DW.heighWarn[2]",
    "PWM_FCE2_0_DW.heighWarn[3]",
    "PWM_FCE2_0_DW.IMUError",
    "PWM_FCE2_0_DW.PumpOverT_error",
    "PWM_FCE2_0_DW.PumpGas_error",
    "PWM_FCE2_0_DW.relayError",
    "PWM_FCE2_0_DW.aerate_error[0]",
    "PWM_FCE2_0_DW.aerate_error[1]",
    "PWM_FCE2_0_DW.aerate_error[2]",
    "PWM_FCE2_0_DW.aerate_error[3]",
    "PWM_FCE2_0_DW.TemperaWarm",
    "PWM_FCE2_0_DW.exhaust_error[0]",
    "PWM_FCE2_0_DW.exhaust_error[1]",
    "PWM_FCE2_0_DW.exhaust_error[2]",
    "PWM_FCE2_0_DW.exhaust_error[3]",
    "PWM_FCE2_0_DW.errorshort[0]",
    "PWM_FCE2_0_DW.errorshort[1]",
    "PWM_FCE2_0_DW.errorshort[2]",
    "PWM_FCE2_0_DW.errorshort[3]",
    "PWM_FCE2_0_DW.errorshort[4]",
    "PWM_FCE2_0_DW.errorshort[5]",
    "PWM_FCE2_0_DW.errorshort[6]",
    "PWM_FCE2_0_DW.errorshort[7]",
    "PWM_FCE2_0_DW.errorbrokrn[0]",
    "PWM_FCE2_0_DW.errorbrokrn[1]",
    "PWM_FCE2_0_DW.errorbrokrn[2]",
    "PWM_FCE2_0_DW.errorbrokrn[3]",
    "PWM_FCE2_0_DW.errorbrokrn[4]",
    "PWM_FCE2_0_DW.errorbrokrn[5]",
    "PWM_FCE2_0_DW.errorbrokrn[6]",
    "PWM_FCE2_0_DW.errorbrokrn[7]",
  ];
}

function get_warning_msgs() {
  return;
}

const warningMessages = [
  "左前高度传感器故障！",
  "右前高度传感器故障！",
  "左后高度传感器故障！",
  "右后高度传感器故障！",
  "IMU传感器故障！",
  "打气泵工作超时故障！",
  "打气泵与储气罐供气系统故障！",
  "打气泵电气系统故障！",
  "左前空气弹簧充气系统故障！",
  "右前空气弹簧充气系统故障！",
  "左后空气弹簧充气系统故障！",
  "右后空气弹簧充气系统故障！",
  "打气泵温度过高！",
  "左前空气弹簧排气系统故障！",
  "右前空气弹簧排气系统故障！",
  "左后空气弹簧排气系统故障！",
  "右后空气弹簧排气系统故障！",
  "左前K1空气阀短路故障！",
  "右前K1空气阀短路故障！",
  "左前K2空气阀短路故障！",
  "右前K2空气阀短路故障！",
  "左后K1空气阀短路故障！",
  "右后K1空气阀短路故障！",
  "左后K2空气阀短路故障！",
  "右后K2空气阀短路故障！",
  "左前K1空气阀断路故障！",
  "右前K1空气阀断路故障！",
  "左前K2空气阀断路故障！",
  "右前K2空气阀断路故障！",
  "左后K1空气阀断路故障！",
  "右后K1空气阀断路故障！",
  "左后K2空气阀断路故障！",
  "右后K2空气阀断路故障！",
];

async function checkAllWarns() {
  if (!pcmConnected) {
    return;
  }
  const resDataString = await async_read_multiple_variables(get_warning_vars());
  const vars = JSON.parse(resDataString);
  for (const varItem of vars) {
    if (varItem.name === "PWM_FCE2_0_DW.TemperaWarm") {
      const temperaWarnImg = document.getElementById("img_TemperaWarm");
      if (temperaWarnImg) {
        temperaWarnImg.style.opacity = varItem.value === 1 ? "100%" : "0%";
      }
    }
    if (varItem.value == 1) {
      addTimedConsoleLog(
        warningMessages[get_warning_vars().indexOf(varItem.name)],
        "red",
        fetchRate
      );
    }
  }
}

function startPeriodicWarningDataFetch() {
  setInterval(checkAllWarns, fetchRate);
}
// ------------------------------------------------------------------

// ------------------------ 加载页面右上角系统信息模块 ------------------------

const carInputListeners = [
  {
    name: "PWM_FCE2_0_DW.speed",
    range: { min: -10, max: 150 },
    label: "车速",
  },
  {
    name: "PWM_FCE2_0_DW.AccelerationPedalPosition",
    range: { min: 0, max: 100 },
    label: "加速踏板",
  },
  {
    name: "PWM_FCE2_0_DW.BrakePosition",
    range: { min: 0, max: 100 },
    label: "制动踏板",
  },
  {
    name: "PWM_FCE2_0_DW.SteeringWheelAngle",
    range: { min: -720, max: 720 },
    label: "方向盘",
  },
];

function loadInfoPanelModule() {
  loadModule("./info-panel.html", infoPanelModuleCallback);
}

function infoPanelModuleCallback() {
  $("#sys-info-input-module-speed").html(
    build_label_input_row("车 速", "speed", "km/h", {
      min: -10,
      max: 150,
      step: 10,
    })
  );
  $("#sys-info-input-module-acce").html(
    build_label_input_row("加速踏板", "AccelerationPedalPosition", "%", {
      min: 0,
      max: 100,
      step: 10,
    })
  );
  $("#sys-info-input-module-stop").html(
    build_label_input_row("制动踏板", "BrakePosition", "%", {
      min: 0,
      max: 100,
      step: 10,
    })
  );
  $("#sys-info-input-module-wheel").html(
    build_label_input_row("方 向 盘", "SteeringWheelAngle", "度", {
      min: -720,
      max: 720,
      step: 10,
    })
  );

  initInputEventListener(carInputListeners);
}
// ------------------------------------------------------------------

// 给每个input添加输入监听，按下回车就提交输入框的值到freemaster
function initInputEventListener(dataArray) {
  // console.log("start init: ", dataArray);
  for (const item of dataArray) {
    // console.log(`input_${item.name}`);
    const inputElement = document.getElementById(`input_${item.name}`);
    if (!inputElement) {
      console.log(`input_${item.name} load failed`);
      continue;
    }
    inputElement.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        const check = validInput(item.range, inputElement.value);
        if (!check) {
          return;
        }
        await async_write_variable(item.name, inputElement.value);
        addTimedConsoleLog(
          `【${item.label}】成功修改为：${inputElement.value}`,
          "green",
          5000
        );
      }
    });
  }
}

$(document).ready(function () {
  loadInfoPanelModule();
  initPCM();
  startPeriodicWarningDataFetch();
});
