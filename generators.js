const mcGenerator = new Blockly.Generator('MC');


/* -------------------------
   初期化
------------------------- */

mcGenerator.init = function(workspace) {
    this.outputQueue = [];
    this.globalCommands = [];   // ←追加
};

function pushOutput(generator, type, value, isLast=false) {
    generator.outputQueue.push({
        type: type,
        value: value,
        isLast: isLast
    });
}
  
function isFormMode(block, requiredMode) {

    let parent = block.getParent();
  
    while (parent) {
  
      if (parent.type === "formCreate") {
  
        return parent.getFieldValue('formMode') === requiredMode;
  
      }
  
      parent = parent.getParent();
    }
  
    return false;
  }

  function getStatementBlocks(block, inputName) {

    const list = [];
  
    let current = block.getInputTargetBlock(inputName);
  
    while (current) {
  
      list.push(current);
  
      const next = current.nextConnection;
  
      current = next && next.targetBlock();
  
    }
  
    return list;
  }

  function collectCaseCommands(block, generator) {

    const list = [];
  
    let current = block.getInputTargetBlock('caseBody');
  
    while (current) {
  
      if (current.type === 'executeCommand') {
  
        const content =
          generator.valueToCode(current, 'content', 0);
  
        list.push({
          type: 'caseCommand',
          content: content
        });
  
      }
  
      current = current.nextConnection &&
                current.nextConnection.targetBlock();
    }
  
    return list;
  }

  function isInsideActionCase(block) {

    let current = block;
  
    while (current) {
  
      const parent = current.getParent();
  
      if (!parent) return false;
  
      // statement接続か確認
      if (current.previousConnection &&
          current.previousConnection.targetConnection &&
          current.previousConnection.targetConnection.sourceBlock_ === parent) {
  
        if (parent.type === "actionCase") {
          return true;
        }
      }
  
      current = parent;
    }
  
    return false;
  }
  
    
  
/* -------------------------
   最終出力処理
------------------------- */

const BLOCK_PRIORITY = {
    formCreate: 0,
    title: 1,
    body: 2,
    divider: 2,
    header: 2,
    label: 2,
    slider: 2,
    textField: 2,
    dropdown: 2,
    button: 3,
    player: 3,
    playerCase: 4,
    actionCase: 5,
    dropdownCase: 5,
    multi: 6,
    last: 999
  };

  mcGenerator.finish = function(code) {

    // LASTは同タイプ最後だけ残す
    const lastMap = {};
    const normal = [];
  
    for (const item of this.outputQueue) {
  
      if (item.isLast) {
        lastMap[item.type] = item;
      } else {
        normal.push(item);
      }
    }
  
    // LASTをnormalに合流
    const merged = [
      ...normal,
      ...Object.values(lastMap)
    ];
  
    // priorityで完全ソート
    merged.sort((a, b) => {
      const pa = BLOCK_PRIORITY[a.type] ?? 100;
      const pb = BLOCK_PRIORITY[b.type] ?? 100;
      return pa - pb;
    });
    code += `/tag @s add "formIn:`;
    // 出力
    for (const item of merged) {
      code += buildCode(item);
    }
    if (this.globalCommands.length > 0) {
        code += ".cmd("
        let count = 1;
        for (const c of this.globalCommands) {
            code += `'${unwrapAndEscape(c)}'`;
            if (count !== this.globalCommands.length) code += ", ";
            count++;
        }
        code += ")";
    }
    code = code.trim();
    code += '"';
    return code;
  };
  
  
function buildCode(item) {
    switch(item.type) {
        case "formCreate": {
            return `${item.value}\n`;          
        }
        case "title": {
            return `.ttl('${item.value}')\n`;
        }
        case "body": {
            return `.bdy('${item.value}')\n`;
        }
        case "button": {
            return !item.value.picture 
            ? `.btn('${item.value.name}')\n`
            : `.btn('${item.value.name}', '${item.value.picture}')\n`;
        }
        case "player": {
            return !item.value
            ? `.ply()`
            : `.ply('${item.value}')`;
        }
        case "divider": {
            return `.dvd()\n`;
        }
        case "header": {
            return `.hdr('${item.value}')\n`;
        }
        case "label": {
            return `.lbl('${item.value}')\n`;
        }
        case "actionCase": {
            let commands = item.value.commands;
            let result = "";
            let count = 1;
            for (const c of commands) {
                result += `'${unwrapAndEscape(c.content)}'`;
                if (count !== commands.length) result += ", "
                count++;
            }
            return commands.length === 0
            ? `.cs('${item.value.caseNumber}')\n`
            : `.cs('${item.value.caseNumber}', ${result})\n`
        }
        case "playerCase": {
            let commands = item.value.commands;
            let result = "";
            let count = 1;
            for (const c of commands) {
                result += `'${unwrapAndEscape(c.content)}'`;
                if (count !== commands.length) result += ", "
                count++;
            }
            return commands.length === 0
            ? `.cs('player')\n`
            : `.cs('player', ${result})\n`
        }
        case "slider": {
            const obj = item.value;
            let result = `'${obj.label}'`;
            if (!!obj.min) result += `, '${obj.min}'`;
            if (!!obj.max) result += `, '${obj.max}'`;
            if (!!obj.defaultValue) result += `, '${obj.defaultValue}'`;
            if (!!obj.valueStep) result += `, '${obj.valueStep}'`;
            return `.sld(${result})\n`;
        }
        case "textField": {
            const obj = item.value;
            let result = `'${obj.label}'`;
            if (!!obj.placeholder) result += `, '${obj.placeholder}'`;
            if (!!obj.defaultValue) result += `, '${obj.defaultValue}'`;
            return `.txf(${result})\n`;
        }
        case "dropdown": {
            const obj = item.value;
            let result = `'${obj.label}'`;
            if (!!obj.content) result += `, '${obj.content}'`;
            if (!!obj.defaultValue) result += `, '${obj.defaultValue}'`;
            return `.drd(${result})\n`;
        }
        case "toggle": {
            const obj = item.value;
            let result = `'${obj.label}'`;
            if (!obj.cond) {
                result += `, 'false'`;
            } else {
                if (obj.cond.toLowerCase() === "on") {
                    result += `, 'true'`;
                } else if (obj.cond.toLowerCase() === "off") {
                    result += `, 'false'`;
                } else {
                    result += `, 'false'`;
                }
            }
            return `.tgl(${result})\n`;
        }
        case "dropdownCase": {
            let commands = item.value.commands;
            let result = "";
            let count = 1;
            for (const c of commands) {
                result += `'${unwrapAndEscape(c.content)}'`;
                if (count !== commands.length) result += ", "
                count++;
            }
            return commands.length === 0
            ? `.cs('${item.value.elementNumber}', '${item.value.selection}')\n`
            : `.cs('${item.value.elementNumber}', '${item.value.selection}', ${result})\n`
        }
        case "toggleCase": {
            let commands = item.value.commands;
            let result = "";
            let count = 1;
            for (const c of commands) {
                result += `'${unwrapAndEscape(c.content)}'`;
                if (count !== commands.length) result += ", "
                count++;
            }
            return commands.length === 0
            ? `.cs('${item.value.elementNumber}', '${item.value.cond}')\n`
            : `.cs('${item.value.elementNumber}', '${item.value.cond}', ${result})\n`
        }
        default:{
            return "";
        }
    }
}

/* -------------------------
   scrub（次ブロック連結）
------------------------- */

mcGenerator.scrub_ = function(block, code) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = nextBlock ? mcGenerator.blockToCode(nextBlock) : '';
  return code + nextCode;
};

function isUnderFormCreate(block) {

    let parent = block.getParent();
  
    while (parent) {
  
      if (parent.type === "formCreate") {
        return true;
      }
  
      parent = parent.getParent();
    }
  
    return false;
}

/* -------------------------
   文字列整形
------------------------- */

function unwrapAndEscape(code) {
    if (typeof code !== 'string') return code;
  
    code = code.trim();
  
    // 外側のクォートだけ削除（JSON.parse使わない）
    if (
      (code.startsWith('"') && code.endsWith('"')) ||
      (code.startsWith("'") && code.endsWith("'"))
    ) {
      code = code.slice(1, -1);
    }
  
    // 既に "*\" の形になっている箇所はそのままにして、
    // 残りの " を *\" に置換する
    code = code.replace(/(\*\\")|"/g, function(match, alreadyEscaped) {
      return alreadyEscaped ? alreadyEscaped : '*\\"';
    });
  
    return code;
  }
  
  
  

/* -------------------------
   text ブロック
------------------------- */

mcGenerator.forBlock['text'] = function(block) {
  const text = block.getFieldValue('TEXT');
  return [`"${text}"`, 0];
};

mcGenerator.forBlock['math_number'] = function(block) {
    const number = block.getFieldValue('NUM');
    return [number, 0];
  };

/* -------------------------
   title ブロック
   → 出力しない
   → 最後だけ保存
------------------------- */

mcGenerator.forBlock['title'] = function(block) {

    if (!isUnderFormCreate(block)) return "";
  
    const raw =
      mcGenerator.valueToCode(block, 'content', 0) || '""';
  
    const text = unwrapAndEscape(raw);
  
    // LAST追加（trueが重要）
    pushOutput(mcGenerator, "title", text, true);
  
    return "";
  };
/* -------------------------
   formCreate
------------------------- */

mcGenerator.forBlock['formCreate'] = function(block) {

    const text = block.getFieldValue('formMode');
  
    let result = "";
  
    if (text === "ActionForm") result = "A";
    if (text === "ModalForm") result = "M";
  
    // LASTとしてキューへ
    pushOutput(mcGenerator, "formCreate", result, true);
  
    return "";
  };

mcGenerator.forBlock['body'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ActionForm")) return "";
    const raw =
        mcGenerator.valueToCode(block, 'content', 0) || '""';
    const content = unwrapAndEscape(raw);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "body", content);
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['button'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ActionForm")) return "";
    const rawName =
        mcGenerator.valueToCode(block, 'buttonName', 0) || '""';
    const name = unwrapAndEscape(rawName);
    const rawPicture =
        mcGenerator.valueToCode(block, 'picture', 0) || '""';
    const picture = unwrapAndEscape(rawPicture);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "button", {name: name, picture: picture});
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['player'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ActionForm")) return "";
    const raw =
        mcGenerator.valueToCode(block, 'cond', 0) || '""';
    const cond = unwrapAndEscape(raw);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "player", cond);
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['divider'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    pushOutput(mcGenerator, "divider");
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['header'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    const raw =
        mcGenerator.valueToCode(block, 'content', 0) || '""';
    const content = unwrapAndEscape(raw);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "header", content);
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['label'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    const raw =
        mcGenerator.valueToCode(block, 'content', 0) || '""';
    const content = unwrapAndEscape(raw);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "label", content);
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['items'] = function(block) {

    if (!block.getParent()) {
        return ["",0];
    }

    const raw =
        mcGenerator.valueToCode(block, 'picture', 0) || '""';

    const picture = unwrapAndEscape(raw);

    return [`"textures/items/${picture}"`, 0];
};

mcGenerator.forBlock['blocks'] = function(block) {

    if (!block.getParent()) {
        return ["",0];
    }

    const raw =
        mcGenerator.valueToCode(block, 'picture', 0) || '""';

    const picture = unwrapAndEscape(raw);

    return [`"textures/blocks/${picture}"`, 0];
};

mcGenerator.forBlock['ui'] = function(block) {

    if (!block.getParent()) {
        return ["",0];
    }

    const raw =
        mcGenerator.valueToCode(block, 'picture', 0) || '""';

    const picture = unwrapAndEscape(raw);

    return [`"textures/ui/${picture}"`, 0];
};

mcGenerator.forBlock['selection'] = function(block) {

    if (!block.getParent()) {
        return ["",0];
    }

    return [`"{selection}"`, 0];
};

mcGenerator.forBlock['selectedPlayer'] = function(block) {

    if (!block.getParent()) {
        return ["",0];
    }

    return [`"{selectedPlayer}"`, 0];
};

mcGenerator.forBlock['actionCase'] = function(block, generator) {

  if (!isUnderFormCreate(block)) return "";
  if (!isFormMode(block, "ActionForm")) return "";

  const caseNumber =
    generator.valueToCode(block, 'caseNumber', 0) || '0';

  const commands = collectCaseCommands(block, generator);

  pushOutput(generator, "actionCase", {
    caseNumber: caseNumber,
    commands: commands
  });

  return "";
};

mcGenerator.forBlock['actionCase'] = function(block, generator) {

    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ActionForm")) return "";
    const caseNumber =
      generator.valueToCode(block, 'caseNumber', 0) || '0';
  
    const commands = collectCaseCommands(block, generator);
  
    pushOutput(generator, "actionCase", {
      caseNumber: caseNumber,
      commands: commands
    });
  
    return "";
};

mcGenerator.forBlock['executeCommand'] = function(block, generator) {
    if (!isUnderFormCreate(block)) return "";
    const raw =
      generator.valueToCode(block, 'content', 0) || '""';
  
    const content = unwrapAndEscape(raw);
  
    // 外ならglobalに保存
    generator.globalCommands.push(content);
  
    return "";
};

mcGenerator.forBlock['playerCase'] = function(block, generator) {

    if (!isUnderFormCreate(block)) return "";

    const commands = collectCaseCommands(block, generator);

    pushOutput(generator, "playerCase", {
        commands: commands
    });

    return "";
};

mcGenerator.forBlock['join'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawLeft =
        mcGenerator.valueToCode(block, 'valueLeft', 0) || '""'
    const rawRight =
        mcGenerator.valueToCode(block, 'valueRight', 0) || '""';
    const valueLeft = unwrapAndEscape(rawLeft);
    const valueRight = unwrapAndEscape(rawRight);
    return [`"${valueLeft}${valueRight}"`, 0];
};

mcGenerator.forBlock['slider'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ModalForm")) return "";
    const rawLabel =
        mcGenerator.valueToCode(block, 'sldLabel', 0);
    const label = unwrapAndEscape(rawLabel);
    let min = mcGenerator.valueToCode(block, 'min', 0);
    let max = mcGenerator.valueToCode(block, 'max', 0);
    let defaultValue = mcGenerator.valueToCode(block, 'default', 0);
    let valueStep = mcGenerator.valueToCode(block, 'valueStep', 0);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "slider", {label: label, min: min, max: max, defaultValue: defaultValue, valueStep});
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['textField'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ModalForm")) return "";
    const rawLabel =
        mcGenerator.valueToCode(block, 'txfLabel', 0);
    const label = unwrapAndEscape(rawLabel);
    const rawholder =
        mcGenerator.valueToCode(block, 'placeholder', 0);
    const placeholder = unwrapAndEscape(rawholder);
    const rawValue =
        mcGenerator.valueToCode(block, 'default', 0);
    const defaultValue = unwrapAndEscape(rawValue);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "textField", {label: label, placeholder: placeholder, defaultValue: defaultValue});
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['dropdown'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ModalForm")) return "";
    const rawLabel =
        mcGenerator.valueToCode(block, 'drdLabel', 0);
    const label = unwrapAndEscape(rawLabel);
    const rawcontent =
        mcGenerator.valueToCode(block, 'content', 0);
    const content = unwrapAndEscape(rawcontent);
    const rawdefault =
        mcGenerator.valueToCode(block, 'default', 0);
    const defaultValue = unwrapAndEscape(rawdefault);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "dropdown", {label: label, content: content, defaultValue: defaultValue});
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['toggle'] = function(block) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ModalForm")) return "";
    const rawLabel =
        mcGenerator.valueToCode(block, 'tglLabel', 0);
    const label = unwrapAndEscape(rawLabel);
    const rawcond =
        mcGenerator.valueToCode(block, 'cond', 0);
    const cond = unwrapAndEscape(rawcond);
    // MULTI追加（isLastは書かない）
    pushOutput(mcGenerator, "toggle", {label: label, cond: cond});
    return ""; // ←直接出力しない
};

mcGenerator.forBlock['dropdownCase'] = function(block, generator) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ModalForm")) return "";
    const elementNumber =
      generator.valueToCode(block, 'elementNumber', 0) || '0';
    const selection =
      generator.valueToCode(block, 'selection', 0) || '0';
  
    const commands = collectCaseCommands(block, generator);
  
    pushOutput(generator, "dropdownCase", {
        elementNumber: elementNumber,
        selection: selection, 
        commands: commands
    });
  
    return "";
};

mcGenerator.forBlock['toggleCase'] = function(block, generator) {
    if (!isUnderFormCreate(block)) return "";
    if (!isFormMode(block, "ModalForm")) return "";
    const elementNumber =
      generator.valueToCode(block, 'elementNumber', 0) || '0';

    const cond =  block.getFieldValue('cond');

    const commands = collectCaseCommands(block, generator);
  
    pushOutput(generator, "toggleCase", {
        elementNumber: elementNumber,
        cond: cond,
        commands: commands
    });
  
    return "";
};

mcGenerator.forBlock['targetScore'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawScoreName =
        mcGenerator.valueToCode(block, 'scoreName', 0) || '""'
    const rawplayer =
        mcGenerator.valueToCode(block, 'player', 0) || '""';
    const scoreName = unwrapAndEscape(rawScoreName);
    const player = unwrapAndEscape(rawplayer);
    return [`"{score:${player}:${scoreName}}"`, 0];
};

mcGenerator.forBlock['notMe'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    return [`"[distance:!=:0]"`, 0];
};

mcGenerator.forBlock['me'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    return [`"{executer}"`, 0];
};

mcGenerator.forBlock['playerInfo'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawplayer =
        mcGenerator.valueToCode(block, 'player', 0) || '""';
    const player = unwrapAndEscape(rawplayer);
    const info =  block.getFieldValue('info');
    switch(info){
        case "x":{
            return [`"{player:${player}:x}"`, 0];
        }
        case "y":{
            return [`"{player:${player}:y}"`, 0];
        }
        case "z":{
            return [`"{player:${player}:z}"`, 0];
        }
        case "dimension":{
            return [`"{player:${player}:dimension}"`, 0];
        }
        case "health":{
            return [`"{player:${player}:health}"`, 0];
        }
        case "gamemode":{
            return [`"{player:${player}:gamemode}"`, 0];
        }
        default:{
            return [`""`, 0];
        }
    }
};

mcGenerator.forBlock['mathThree'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawLeft =
        mcGenerator.valueToCode(block, 'valueLeft', 0) || '""'
    const rawRight =
        mcGenerator.valueToCode(block, 'valueRight', 0) || '""';
    let valueLeft = unwrapAndEscape(rawLeft);
    valueLeft = String(valueLeft);
    let valueRight = unwrapAndEscape(rawRight);
    valueRight = String(valueRight);
    const operator =  block.getFieldValue('operator');
    switch(operator){
        case "+":{
            return [`"{math:${valueLeft}:+:${valueRight}}"`, 0];
        }
        case "-":{
            return [`"{math:${valueLeft}:-:${valueRight}}"`, 0];
        }
        case "*":{
            return [`"{math:${valueLeft}:*:${valueRight}}"`, 0];
        }
        case "/":{
            return [`"{math:${valueLeft}:/:${valueRight}}"`, 0];
        }
        case "%":{
            return [`"{math:${valueLeft}:%:${valueRight}}"`, 0];
        }
        case "max":{
            return [`"{math:${valueLeft}:max:${valueRight}}"`, 0];
        }
        case "min":{
            return [`"{math:${valueLeft}:min:${valueRight}}"`, 0];
        }
        default:{
            return [`""`, 0];
        }
    }
};

mcGenerator.forBlock['mathTwo'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawValue =
        mcGenerator.valueToCode(block, 'value', 0) || '""'
    let value = unwrapAndEscape(rawValue);
    value = String(value);
    const operator =  block.getFieldValue('operator');
    switch(operator){
        case "abs":{
            return [`"{math:abs:${value}}"`, 0];
        }
        case "floor":{
            return [`"{math:floor:${value}}"`, 0];
        }
        case "ceil":{
            return [`"{math:ceil:${value}}"`, 0];
        }
        case "round":{
            return [`"{math:round:${value}}"`, 0];
        }
        case "trunc":{
            return [`"{math:trunc:${value}}"`, 0];
        }
        default:{
            return [`""`, 0];
        }
    }
};

mcGenerator.forBlock['condPlayer'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawCond =
        mcGenerator.valueToCode(block, 'cond', 0) || '""'
    const cond = unwrapAndEscape(rawCond);
    const mode =  block.getFieldValue('mode');
    switch(mode){
        case "name":{
            if (!cond) {
                return [`"{condplayer:name}"`, 0];
            } else {
                return [`"{condplayer:name:${cond}}"`, 0];
            }
        }
        case "count":{
            if (!cond) {
                return [`"{condplayer:count}"`, 0];
            } else {
                return [`"{condplayer:count:${cond}}"`, 0];
            }
        }
        default:{
            return [`""`, 0];
        }
    }
};

mcGenerator.forBlock['hastag'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawName =
        mcGenerator.valueToCode(block, 'name', 0) || '""'
    const name = unwrapAndEscape(rawName);
    return [`"[hastag:${name}]"`, 0];
};

mcGenerator.forBlock['cond'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawLeft =
        mcGenerator.valueToCode(block, 'valueLeft', 0) || '""'
    const rawRight =
        mcGenerator.valueToCode(block, 'valueRight', 0) || '""';
    let valueLeft = unwrapAndEscape(rawLeft);
    valueLeft = String(valueLeft);
    let valueRight = unwrapAndEscape(rawRight);
    valueRight = String(valueRight);
    const operator =  block.getFieldValue('operator');
    switch(operator){
        case "=": {
            return [`"[cond:${valueLeft}:=:${valueRight}]"`, 0];
        }
        case "!=": {
            return [`"[cond:${valueLeft}:!=:${valueRight}]"`, 0];
        }
        case ">": {
            return [`"[cond:${valueLeft}:>:${valueRight}]"`, 0];
        }
        case ">=": {
            return [`"[cond:${valueLeft}:>=:${valueRight}]"`, 0];
        }
        case "<": {
            return [`"[cond:${valueLeft}:<:${valueRight}]"`, 0];
        }
        case "<=": {
            return [`"[cond:${valueLeft}:<=:${valueRight}]"`, 0];
        }
        default: {
            return [`""`, 0];
        }
    }
};

mcGenerator.forBlock['includes'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawValue =
        mcGenerator.valueToCode(block, 'value', 0) || '""'
    const value = unwrapAndEscape(rawValue);
    const rawPart =
        mcGenerator.valueToCode(block, 'part', 0) || '""'
    const part = unwrapAndEscape(rawValue);
    return [`"[includes:${value}:${part}]"`, 0];
};

mcGenerator.forBlock['and'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawLeft =
        mcGenerator.valueToCode(block, 'condLeft', 0) || '""'
    const condLeft = unwrapAndEscape(rawLeft);
    const rawRight =
        mcGenerator.valueToCode(block, 'condRight', 0) || '""'
    const condRight = unwrapAndEscape(rawRight);
    return [`"${condLeft} ${condRight}"`, 0];
};

mcGenerator.forBlock['or'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawLeft =
        mcGenerator.valueToCode(block, 'condLeft', 0) || '""'
    const condLeft = unwrapAndEscape(rawLeft);
    const rawRight =
        mcGenerator.valueToCode(block, 'condRight', 0) || '""'
    const condRight = unwrapAndEscape(rawRight);
    return [`"[${condLeft} | ${condRight}]"`, 0];
};

mcGenerator.forBlock['not'] = function(block) {
    if (!block.getParent()) {
        return ["",0];
    }
    const rawCond =
        mcGenerator.valueToCode(block, 'cond', 0) || '""'
    const cond = unwrapAndEscape(rawCond);
    return [`"[not:${cond}]"`, 0];
};