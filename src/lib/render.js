// Pure HTML builders lifted out of app.js. Neither function touches the DOM,
// so both run at build time (to prerender each page's form and its default
// result) and in the browser (to re-render on input). Keeping one copy means
// the server-rendered markup and the client-updated markup cannot drift.

import { fmt } from "./calculators.js";

export function fieldHtml(f) {
  const wrapClasses = ["field"];
  if (f.type === "currency") wrapClasses.push("has-prefix");
  if (f.type === "percent" || f.suffix) wrapClasses.push("has-suffix");
  let inputHtml;
  if (f.type === "select") {
    inputHtml = `<select id="f_${f.key}" name="${f.key}">${f.options.map(o => `<option value="${o[0]}" ${String(o[0])===String(f.default)?"selected":""}>${o[1]}</option>`).join("")}</select>`;
  } else if (f.type === "date") {
    inputHtml = `<input type="date" id="f_${f.key}" name="${f.key}" value="${f.default}" />`;
  } else if (f.type === "text") {
    inputHtml = `<input type="text" id="f_${f.key}" name="${f.key}" value="${f.default}" />`;
  } else {
    inputHtml = `<input type="number" id="f_${f.key}" name="${f.key}" value="${f.default}" step="${f.step || "any"}" />`;
  }
  const prefix = f.type === "currency" ? `<span class="prefix">$</span>` : "";
  const suffix = f.type === "percent" ? `<span class="suffix">%</span>` : (f.suffix ? `<span class="suffix">${f.suffix}</span>` : "");
  return `<div class="${wrapClasses.join(" ")}">
    <label for="f_${f.key}">${f.label}</label>
    <div class="input-wrap">${prefix}${inputHtml}${suffix}</div>
  </div>`;
}

export function resultHtml(result) {
  if (!result || result.error) {
    return `<div class="placeholder err">${result ? result.error : "Enter valid inputs to see results."}</div>`;
  }
  let html = "";
  if (result.primary) {
    html += `<div class="result-primary"><div class="label">${result.primary.label}</div><div class="value${result.primary.value && String(result.primary.value).trim().startsWith("-") ? " neg" : ""}">${result.primary.value}</div></div>`;
  }
  if (result.cells && result.cells.length) {
    html += `<div class="result-grid">${result.cells.map(c => `<div class="cell"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join("")}</div>`;
  }
  if (result.bars && result.bars.length) {
    html += `<div class="bars">${result.bars.map(b => `<div class="bar-row"><span>${b.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0, Math.min(100, b.pct || 0))}%"></div></div><span>${b.value}</span></div>`).join("")}</div>`;
  }
  if (result.donut && result.donut.segments) {
    const segs = result.donut.segments;
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    let acc = 0;
    const gradParts = segs.map(s => { const start = acc / total * 360; acc += s.value; const end = acc / total * 360; return `${s.color} ${start}deg ${end}deg`; });
    html += `<div class="donut">
      <div style="width:110px;height:110px;border-radius:50%;background:conic-gradient(${gradParts.join(",")});"></div>
      <div class="legend">${segs.map(s => `<div class="li"><span class="dot" style="background:${s.color}"></span>${s.label}: ${fmt.pct(s.value, 0)}</div>`).join("")}</div>
    </div>`;
  }
  if (result.table) {
    html += `<div class="table-wrap"><table class="amort"><thead><tr>${result.table.headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${result.table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  if (result.note) html += `<div class="result-note">${result.note}</div>`;
  return html;
}
