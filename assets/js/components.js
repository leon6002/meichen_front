const projectPrefix = "PWM_FCE2_0_DW.";

function enforceMinMax(el) {
  if (el.value != "") {
    console.log(el.min);
    console.log(`${parseFloat(el.value)}, ${parseFloat(el.min)} `);
    if (parseFloat(el.value) < parseFloat(el.min)) {
      el.value = el.min;
    }
    if (parseFloat(el.value) > parseFloat(el.max)) {
      el.value = el.max;
    }
  }
}

function buildCheckbox(name, label, checked) {
  const varName = projectPrefix + name;

  let string = `<div>`;
  string += `<label for="checkbox_${varName}">`;
  string += `<input type="checkbox" name="${label}" value="${varName}" id="checkbox_${varName}"/>`;
  string += `${label}</label></div>`;
  return string;
}

function build_label_input_row(varLabel, varID, varUnit, options) {
  const prefix = varID.includes(projectPrefix) ? "" : projectPrefix;
  const disabled = (options?.disabled ?? true) === false ? "" : "disabled";
  const enforceMinMax = isNumber(options?.min) || isNumber(options?.max);
  const inputType = options?.type ?? "number";
  const fontSize = options?.fontSize ?? 11;
  const defaultValue = options?.value ?? "0";
  const justifyContent = options?.justifyContent ?? "start";
  let inputWidth = 70;
  let unitWidth = 0;
  if (varUnit !== "" && varUnit !== undefined) {
    inputWidth = 55;
    unitWidth = 26;
  }
  const fixedWidth = inputWidth + unitWidth;

  let string = `<div id="row_${prefix}${varID}" class="label-input__item__container" style="font-size: ${fontSize}px; justify-content: ${justifyContent};">`;
  string += `<label style="max-width: calc(100% - ${fixedWidth}px);">${varLabel}</label>`;
  string += `<input id="input_${prefix}${varID}" type="${inputType}" name="${varID}" value="${defaultValue}"`;
  string +=
    (isNumber(options?.min) ? ` min="${options.min}" ` : "") +
    (isNumber(options?.max) ? ` max="${options.max}" ` : "");
  string +=
    enforceMinMax && isNumber(options.step) ? ` step=${options.step}` : "";
  string += enforceMinMax ? " onkeyup=enforceMinMax(this)" : "";
  string += ` style="width: ${inputWidth}px; height: 20px; font-size: 10px;" ${disabled} />`;
  string +=
    varUnit !== "" && varUnit !== undefined
      ? `<span style="width: ${unitWidth}px">${varUnit}</span>`
      : "";
  string += "</div>";
  return string;
}

function build_label_input_row_large(varLabel, varID, varUnit, options) {
  if (options) {
    options.fontSize = 14;
  } else {
    options = {
      fontSize: 14,
    };
  }
  return build_label_input_row(varLabel, varID, varUnit, options);
}

function buildChartDiv(id) {
  const container = document.getElementById(id);
  let string = "";
  string =
    string +
    `<div id="box" class="chartWithOverlay" style="min-height: 350px">`;
  string = string + `<div id="chatOverlayWrapper" class="overlay"></div>`;
  string =
    string +
    `<div id="chart_div" style="width: 100%; height: 100%; position: relative; background-color: black;"></div>`;
  string = string + `</div>`;
  container.innerHTML = string;
}

/**
 * 输入框组件
 * @param {string} id 容器id
 * @param {*} rows 数据内容，row数组，里面是column数组,
 * column字段有：
 * 1. label:输入框左边的文案
 * 2. name:变量名，会作为input框的元素id
 * 3. unit:输入框右边的单位文案,可以为空字符串
 * 4. options: 配置项，具体查看 build_label_input_row()方法的介绍
 * 示例：
 * [
 *   [
 *     { label: "质量", name: "Ms", unit: "", options: {disabled: false} },
 *     { label: "左前弹簧刚度", name: "FL_stiff", unit: "", options: {disabled: false}},
 *   ],
 *   [
 *     { label: "惯性参数Ix", name: "Ix", unit: "", options: {disabled: false}},
 *     { label: "右前弹簧刚度", name: "FR_stiff", unit: "", options: {disabled: false}},
 *   ]
 * ]
 */
function buildLabeledInputs(id, rows) {
  const container = document.getElementById(id);
  let innerContent = "";
  rows.forEach((row) => {
    innerContent += `<div class="label-input__row">`;
    row.forEach((column) => {
      innerContent += build_label_input_row(
        column.label,
        column.name,
        column.unit,
        column.options
      );
    });
    innerContent += "</div>";
  });
  container.innerHTML = innerContent;
}

//加载单独模块
function loadModule(url, callback) {
  $.get(url, function (result) {
    var html = $(result);
    var __templates = html;
    $("[slot]").each(function () {
      var id = $(this).attr("slot");
      var body = $(__templates)
        .find("#" + id)
        .html();
      // console.log("body is:", body);
      $(this).html(body);
      callback();
    });
  });
}
