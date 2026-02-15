function requireFormMode(block, requiredMode) {

  let parent = block.getParent();

  while (parent) {

    if (parent.type === "formCreate") {

      const mode = parent.getFieldValue('formMode');

      if (mode !== requiredMode && requiredMode !== null) {
        block.setWarningText(requiredMode + " の時だけ使用できます");
      } else {
        block.setWarningText(null);
      }

      return;
    }

    parent = parent.getParent();
  }

  block.setWarningText("formCreateの中でのみ使用できます");
}

const formCreate = {
  init: function() {
    this.appendDummyInput('formMode')
      .appendField('モード：')
      .appendField(new Blockly.FieldDropdown([
          ['アクションフォーム', 'ActionForm'],
          ['モーダルフォーム', 'ModalForm']
        ]), 'formMode');
    this.appendDummyInput('')
      .appendField('のフォームを作成する');
    this.setInputsInline(true)
    this.setNextStatement(true, ['normal', 'action', 'mdal']);
    this.setTooltip('フォームを作成します');
    this.setHelpUrl('');
    this.setColour(255);
  }
};
Blockly.common.defineBlocks({formCreate: formCreate});

const fake = {
  init: function() {
    this.appendDummyInput('')
      .appendField('フェイク君');
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({fake: fake});

const title = {
  init: function() {
    this.appendValueInput('content')
      .setCheck('String')
      .appendField('フォームのタイトルを');
    this.appendDummyInput('')
      .appendField('に設定する');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action', 'modal']);
    this.setNextStatement(true, ['normal', 'action', 'modal']);
    this.setTooltip('フォームのタイトルを設定します');
    this.setHelpUrl('');
    this.setColour(255);
  },
  onchange: function() {
    requireFormMode(this, null);
  }
};
Blockly.common.defineBlocks({title: title});

const body = {
  init: function() {
    this.appendValueInput('content')
      .setCheck('String')
      .appendField('フォームのボディーに');
    this.appendDummyInput('')
      .appendField('を追加する');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action']);
    this.setNextStatement(true, ['normal', 'action']);
    this.setTooltip('ボディーを追加してフォームに説明文を書くことができます');
    this.setHelpUrl('');
    this.setColour(345);
  },
  onchange: function() {
    requireFormMode(this, "ActionForm");
  }
};
Blockly.common.defineBlocks({body: body});

const button = {
  init: function() {
    this.appendValueInput('buttonName')
      .appendField('名前：');
    this.appendDummyInput('')
      .appendField('のボタンを追加する');
    this.appendValueInput('picture')
    .setCheck('picture')
      .appendField('画像（任意）：');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action']);
    this.setNextStatement(true, ['normal', 'action']);
    this.setTooltip('フォームにボタンを追加します');
    this.setHelpUrl('');
    this.setColour(345);
  },
  onchange: function() {
    requireFormMode(this, "ActionForm");
  }
};
Blockly.common.defineBlocks({button: button});

const player = {
  init: function() {
    this.appendValueInput('cond')
    .setCheck('cond')
      .appendField('プレイヤーをボタンとして追加する　条件（任意）：');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action']);
    this.setNextStatement(true, ['normal', 'action']);
    this.setTooltip('フォームにプレイヤーの名前のボタンを追加します。条件式で絞り込めます。');
    this.setHelpUrl('');
    this.setColour(345);
  },
  onchange: function() {
    requireFormMode(this, "ActionForm");
  }
};
Blockly.common.defineBlocks({player: player});

const divider = {
  init: function() {
    this.appendDummyInput('')
      .appendField('横線を追加する');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action', 'modal']);
    this.setNextStatement(true, ['normal', 'action', 'modal']);
    this.setTooltip('フォームにdividerという横線を追加します');
    this.setHelpUrl('');
    this.setColour(255);
  },
  onchange: function() {
    requireFormMode(this, null);
  }
};
Blockly.common.defineBlocks({divider: divider});

const actionCase = {
  init: function() {
    this.appendValueInput('caseNumber')
    .setCheck('Number')
      .appendField('ボタン番号：');
    this.appendDummyInput('')
      .appendField('が押された時');
    this.appendStatementInput('caseBody')
    .setCheck('command');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action']);
    this.setNextStatement(true, ['normal', 'action']);
    this.setTooltip('設定したボタンが押された時に中を実行します。\nボタン番号は、上から[0,1,2...]になります。（プレイヤーを除く）');
    this.setHelpUrl('');
    this.setColour(345);
  },
  onchange: function() {
    requireFormMode(this, "ActionForm");
  }
};
Blockly.common.defineBlocks({actionCase: actionCase});

const playerCase = {
  init: function() {
    this.appendDummyInput('')
      .appendField('プレイヤーのボタンが押された時');
    this.appendStatementInput('caseBody')
    .setCheck('command');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action']);
    this.setNextStatement(true, ['normal', 'action']);
    this.setTooltip('プレイヤーのボタンが押された時に中を実行します。');
    this.setHelpUrl('');
    this.setColour(345);
  },
  onchange: function() {
    requireFormMode(this, "ActionForm");
  }
};
Blockly.common.defineBlocks({playerCase: playerCase});

const executeCommand = {
  init: function() {
    this.appendValueInput('content')
    .setCheck('String')
      .appendField('コマンド：');
    this.appendDummyInput('')
      .appendField('を実行する');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action', 'modal', 'command']);
    this.setNextStatement(true, ['normal', 'action', 'modal', 'command']);
    this.setTooltip('入力されたマイクラのコマンドを実行します');
    this.setHelpUrl('');
    this.setColour(255);
  },
  onchange: function() {
    requireFormMode(this, null);
  }
};
Blockly.common.defineBlocks({executeCommand: executeCommand});

const items = {
  init: function() {
    this.appendValueInput('picture')
    .setCheck('String')
      .appendField('アイテムの画像　アイテムID：');
    this.setInputsInline(true)
    this.setOutput(true, 'picture');
    this.setTooltip('ボタンの横に付ける画像です。\nテクスチャとアイテムIDが必ず一致するわけではありませんので、ご注意ください。');
    this.setHelpUrl('');
    this.setColour(345);
  }
};
Blockly.common.defineBlocks({items: items});


const blocks = {
  init: function() {
    this.appendValueInput('picture')
    .setCheck('String')
      .appendField('ブロックの画像　ブロックID：');
    this.setInputsInline(true)
    this.setOutput(true, 'picture');
    this.setTooltip('ボタンの横に付けるブロックの画像です。\nテクスチャとブロックIDが必ず一致するわけではありませんので、ご注意ください。');
    this.setHelpUrl('');
    this.setColour(345);
  }
};
Blockly.common.defineBlocks({blocks: blocks});

const ui = {
  init: function() {
    this.appendValueInput('picture')
    .setCheck('String')
      .appendField('UIの画像 ID：');
    this.setInputsInline(true)
    this.setOutput(true, 'picture');
    this.setTooltip('ボタンの横に付けるUIの画像です。\nUIのIDは検索してください');
    this.setHelpUrl('');
    this.setColour(345);
  }
};
Blockly.common.defineBlocks({ui: ui});

const cancel = {
  init: function() {
    this.appendValueInput('content')
    .setCheck('String')
      .appendField('キャンセルされた時のメッセージを');
    this.appendDummyInput('')
      .appendField('に設定する');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'action', 'modal']);
    this.setNextStatement(true, ['normal', 'action', 'modal']);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setColour(255);
  },
  onchange: function() {
    requireFormMode(this, null);
  }
};
Blockly.common.defineBlocks({cancel: cancel});

const header = {
  init: function() {
    this.appendValueInput('content')
    .setCheck('String')
      .appendField('フォームのヘッダーに');
    this.appendDummyInput('')
      .appendField('を追加する');
    this.setPreviousStatement(true, ['normal', 'action', 'modal']);
    this.setNextStatement(true, ['normal', 'action', 'modal']);
    this.setTooltip('ヘッダーをフォームに追加します');
    this.setHelpUrl('');
    this.setColour(255);
  },
  onchange: function() {
    requireFormMode(this, null);
  }
};
Blockly.common.defineBlocks({header: header});
                    
const label = {
  init: function() {
    this.appendValueInput('content')
    .setCheck('String')
      .appendField('フォームのラベルに');
    this.appendDummyInput('')
      .appendField('を追加する');
    this.setPreviousStatement(true, ['normal', 'action', 'modal']);
    this.setNextStatement(true, ['normal', 'action', 'modal']);
    this.setTooltip('ラベルをフォームに追加します');
    this.setHelpUrl('');
    this.setColour(255);
  },
  onchange: function() {
    requireFormMode(this, null);
  }
};
Blockly.common.defineBlocks({label: label});

const slider = {
  init: function() {
    this.appendDummyInput('')
      .appendField('スライダーを追加');
    this.appendValueInput('sldLabel')
    .setCheck('String')
      .appendField('スライダーのラベル：');
    this.appendValueInput('min')
    .setCheck('Number')
      .appendField('最小値：');
    this.appendValueInput('max')
    .setCheck('Number')
      .appendField('最大値：');
    this.appendValueInput('default')
    .setCheck('Number')
      .appendField('デフォルトの値：');
    this.appendValueInput('valueStep')
    .setCheck('Number')
      .appendField('一度に刻む数(任意)：');
    this.setInputsInline(false)
    this.setPreviousStatement(true, ['normal', 'modal']);
    this.setNextStatement(true, ['normal', 'modal']);
    this.setTooltip('フォームにスライダーを追加します');
    this.setHelpUrl('');
    this.setColour(165);
  },
  onchange: function() {
    requireFormMode(this, "ModalForm");
  }
};
Blockly.common.defineBlocks({slider: slider});

const textField = {
  init: function() {
    this.appendDummyInput('')
      .appendField('テキストボックスを追加');
    this.appendValueInput('txfLabel')
    .setCheck('String')
      .appendField('テキストボックスのラベル：');
    this.appendValueInput('placeholder')
    .setCheck('String')
      .appendField('プレースホルダー：');
    this.appendValueInput('default')
    .setCheck('String')
      .appendField('デフォルトの文字：');
    this.setPreviousStatement(true, ['normal', 'modal']);
    this.setNextStatement(true, ['normal', 'modal']);
    this.setTooltip('テキストボックスを追加します');
    this.setHelpUrl('');
    this.setColour(165);
  },
  onchange: function() {
    requireFormMode(this, "ModalForm");
  }
};
Blockly.common.defineBlocks({textField: textField});
                    
const dropdown = {
  init: function() {
    this.appendDummyInput('')
      .appendField('選択肢（ドロップダウン）を追加');
    this.appendValueInput('drdLabel')
    .setCheck('String')
      .appendField('選択肢のラベル：');
    this.appendValueInput('content')
    .setCheck('String')
      .appendField('選択肢（" , "で区切る）：');
    this.appendValueInput('default')
    .setCheck('Number')
      .appendField('デフォルトの選択番号：');
    this.setPreviousStatement(true, ['normal', 'modal']);
    this.setNextStatement(true, ['normal', 'modal']);
    this.setTooltip('ドロップダウンという選択肢を選ぶものを追加します。\n選択肢内に" , "が含まれる場合""で囲んでください\n選択番号は、上から順に[0,1,2...]です。');
    this.setHelpUrl('');
    this.setColour(165);
  },
  onchange: function() {
    requireFormMode(this, "ModalForm");
  }
};
Blockly.common.defineBlocks({dropdown: dropdown});
                    
const toggle = {
  init: function() {
    this.appendDummyInput('')
      .appendField('トグル（スイッチ）を追加');
    this.appendValueInput('tglLabel')
    .setCheck('String')
      .appendField('トグルのラベル：');
    this.appendValueInput('cond')
    .setCheck('String')
      .appendField('初期値（On / Off)');
    this.setPreviousStatement(true, ['normal', 'modal']);
    this.setNextStatement(true, ['normal', 'modal']);
    this.setTooltip('トグルと呼ばれるスイッチを追加します');
    this.setHelpUrl('');
    this.setColour(165);
  },
  onchange: function() {
    requireFormMode(this, "ModalForm");
  }
};
Blockly.common.defineBlocks({toggle: toggle});

const join = {
  init: function() {
    this.appendValueInput('valueLeft')
    .setCheck('String');
    this.appendDummyInput('')
      .appendField('と');
    this.appendValueInput('valueRight')
    .setCheck('String');
    this.setInputsInline(true)
    this.setOutput(true, ['cond', 'String']);
    this.setTooltip('文字列を合体させます');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({join: join});

const dropdownCase = {
  init: function() {
    this.appendValueInput('elementNumber')
    .setCheck('Number')
      .appendField('要素番号：');
    this.appendValueInput('selection')
    .setCheck('Number')
      .appendField('のドロップダウンの選択肢：');
    this.appendDummyInput('')
      .appendField('番を選択した時');
    this.appendStatementInput('caseBody')
    .setCheck('command');
    this.setInputsInline(true)
    this.setPreviousStatement(true, ['normal', 'modal']);
    this.setNextStatement(true, ['normal', 'modal']);
    this.setTooltip('ドロップダウンの選択肢によってコマンドを実行します。\n要素番号は、「スイッチ、スライダー、テキストボックス、ドロップダウン」に\nフォームの上から数えて[0,1,2...]と割り振られます。\n選択肢の番号も同様に、上から[0,1,2...]と割り振られます。');
    this.setHelpUrl('');
    this.setColour(165);
  },
  onchange: function() {
    requireFormMode(this, "ModalForm");
  }
};
Blockly.common.defineBlocks({dropdownCase: dropdownCase});

const toggleCase = {
  init: function() {
    this.appendValueInput('elementNumber')
    .setCheck('Number')
      .appendField('要素番号：');
    this.appendDummyInput('')
      .appendField('のスイッチが')
      .appendField(new Blockly.FieldDropdown([
          ['On', 'true'],
          ['Off', 'false']
        ]), 'cond');
    this.appendDummyInput('')
      .appendField('のとき');
    this.appendStatementInput('caseBody')
    .setCheck('command');
    this.setInputsInline(true)
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('スイッチ（トグル）の状態によってコマンドを実行します\n要素番号は、「スイッチ、スライダー、テキストボックス、ドロップダウン」に\nフォームの上から数えて[0,1,2...]と割り振られます。');
    this.setHelpUrl('');
    this.setColour(165);
  },
  onchange: function() {
    requireFormMode(this, "ModalForm");
  }
};
Blockly.common.defineBlocks({toggleCase: toggleCase});

const targetScore = {
  init: function() {
    this.appendValueInput('scoreName')
    .setCheck('String')
      .appendField('スコア名：');
    this.appendValueInput('player')
    .setCheck('String')
      .appendField('のプレイヤー：');
    this.appendDummyInput('')
      .appendField('の値');
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('');
    this.setHelpUrl('');
    this.setColour(120);
  }
};
Blockly.common.defineBlocks({targetScore: targetScore});

const me = {
  init: function() {
    this.appendDummyInput('')
      .appendField('自分');
    this.setOutput(true, null);
    this.setTooltip('自分の名前を出力します');
    this.setHelpUrl('');
    this.setColour(120);
  }
};
Blockly.common.defineBlocks({me: me});

const playerInfo = {
  init: function() {
    this.appendValueInput('player')
    .setCheck('String')
      .appendField('プレイヤー：');
    this.appendDummyInput('')
      .appendField('の');
    this.appendDummyInput('')
      .appendField(new Blockly.FieldDropdown([
          ['x座標', 'x'],
          ['y座標', 'y'],
          ['z座標', 'z'],
          ['ディメンション', 'dimension'],
          ['体力', 'health'],
          ['ゲームモード', 'gamemode']
        ]), 'info');
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('プレイヤーの情報を取得します');
    this.setHelpUrl('');
    this.setColour(120);
  }
};
Blockly.common.defineBlocks({playerInfo: playerInfo});

const mathThree = {
  init: function() {
    this.appendValueInput('valueLeft')
    .setCheck(['Number', 'String']);
    this.appendDummyInput('')
      .appendField(new Blockly.FieldDropdown([
          ['+', '+'],
          ['-', '-'],
          ['×', '*'],
          ['÷', '/'],
          ['%', '%'],
          ['より大きい方', 'max'],
          ['より小さい方', 'min']
        ]), 'operator');
    this.appendValueInput('valueRight')
    .setCheck(['Number', 'String']);
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('二つの数を演算します');
    this.setHelpUrl('');
    this.setColour(120);
  }
};
Blockly.common.defineBlocks({mathThree: mathThree});

const mathTwo = {
  init: function() {
    this.appendValueInput('value')
    .setCheck(['Number', 'String']);
    this.appendDummyInput('')
      .appendField(new Blockly.FieldDropdown([
          ['の絶対値', 'abs'],
          ['小数点切り捨て(floor)', 'floor'],
          ['小数点切り上げ', 'ceil'],
          ['四捨五入', 'round'],
          ['小数点切り捨て(trunc)', 'trunc']
        ]), 'operator');
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('数を演算します');
    this.setHelpUrl('');
    this.setColour(120);
  }
};
Blockly.common.defineBlocks({mathTwo: mathTwo});

const condPlayer = {
  init: function() {
    this.appendDummyInput('')
      .appendField('プレイヤーの')
      .appendField(new Blockly.FieldDropdown([
          ['名前', 'name'],
          ['人数', 'count']
        ]), 'mode');
    this.appendValueInput('cond')
    .setCheck('cond')
      .appendField('を取得する　条件（任意）：');
    this.setOutput(true, 'String');
    this.setTooltip('プレイヤーの名前や人数を取得します。条件で絞り込めます');
    this.setHelpUrl('');
    this.setColour(120);
  }
};
Blockly.common.defineBlocks({condPlayer: condPlayer});

const hastag = {
  init: function() {
    this.appendValueInput('name')
    .setCheck('String')
      .appendField('条件');
    this.appendDummyInput('')
      .appendField('のタグを持っている');
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('条件：タグを持っている');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({hastag: hastag});

const cond = {
  init: function() {
    this.appendValueInput('valueLeft')
    .setCheck(['String', 'Number'])
      .appendField('条件');
    this.appendDummyInput('')
      .appendField(new Blockly.FieldDropdown([
          ['==', '='],
          ['!=', '!='],
          ['>', '>'],
          ['>=', '>='],
          ['<', '<'],
          ['<=', '<=']
        ]), 'operator');
    this.appendValueInput('valueRight')
    .setCheck(['String', 'Number']);
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('条件：以下の等式を満たす');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({cond: cond});

const includes = {
  init: function() {
    this.appendValueInput('value')
    .setCheck('String')
      .appendField('条件　文字列：');
    this.appendValueInput('part')
    .setCheck('String')
      .appendField('が以下を含む：');
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('条件：文字列が以下の文字を含む');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({includes: includes});

const and = {
  init: function() {
    this.appendValueInput('condLeft')
    .setCheck('cond')
      .appendField('条件');
    this.appendDummyInput('')
      .appendField('かつ');
    this.appendValueInput('condRight')
    .setCheck('cond');
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('条件：両方の条件を満たす');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({and: and});

const or = {
  init: function() {
    this.appendValueInput('condLeft')
    .setCheck('String')
      .appendField('条件');
    this.appendDummyInput('')
      .appendField('または');
    this.appendValueInput('condRight')
    .setCheck('String');
    this.setOutput(true, 'cond');
    this.setTooltip('条件：二つの条件を一つ以上満たす');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({or: or});

const not = {
  init: function() {
    this.appendValueInput('cond')
    .setCheck('cond')
      .appendField('条件');
    this.appendDummyInput('')
      .appendField('ではない');
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('条件：条件を満たさない');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({not: not});

const selection = {
  init: function() {
    this.appendDummyInput('')
      .appendField('選択したボタン番号');
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('選択したボタン番号を出力します');
    this.setHelpUrl('');
    this.setColour(345);
  }
};
Blockly.common.defineBlocks({selection: selection});

const selectedPlayer = {
  init: function() {
    this.appendDummyInput('')
      .appendField('選択したプレイヤー');
    this.setInputsInline(true)
    this.setOutput(true, 'String');
    this.setTooltip('選択したプレイヤーの値を返します。\n他のボタンを選択した場合、空の文字列を返します');
    this.setHelpUrl('');
    this.setColour(345);
  }
};
Blockly.common.defineBlocks({selectedPlayer: selectedPlayer});

const notMe = {
  init: function() {
    this.appendDummyInput('')
      .appendField('条件：自分ではない');
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('条件：ターゲットが自分ではない');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({notMe: notMe});

const stringToCond = {
  init: function() {
    this.appendValueInput('string')
    .setCheck('String')
      .appendField('文字列から条件に');
    this.setInputsInline(true)
    this.setOutput(true, 'cond');
    this.setTooltip('有効な文字列を条件にします。（高度な機能）');
    this.setHelpUrl('');
    this.setColour(225);
  }
};
Blockly.common.defineBlocks({stringToCond: stringToCond});

const formValues = {
  init: function() {
    this.appendValueInput('elementNumber')
    .setCheck(['Number', 'String'])
      .appendField('要素番号：');
    this.appendDummyInput('')
      .appendField('の結果（値）');
    this.setOutput(true, 'String');
    this.setTooltip('フォームの要素の選択結果を返します。\n要素番号は、「スイッチ、スライダー、テキストボックス、ドロップダウン」に\nフォームの上から数えて[0,1,2...]と割り振られます。');
    this.setHelpUrl('');
    this.setColour(165);
  }
};
Blockly.common.defineBlocks({formValues: formValues});
                    
