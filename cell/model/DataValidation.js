/*
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function (window, undefined) {
	/*
	 * Import
	 * -----------------------------------------------------------------------------
	 */
	var EDataValidationType = {
		None: 0,
		Custom: 1,
		Date: 2,
		Decimal: 3,
		List: 4,
		TextLength: 5,
		Time: 6,
		Whole: 7
	};
	var EDataValidationErrorStyle = {
		Stop: 0,
		Warning: 1,
		Information: 2
	};
	var EDataValidationImeMode = {
		NoControl: 0,
		Off: 1,
		On: 2,
		Disabled: 3,
		Hiragana: 4,
		FullKatakana: 5,
		HalfKatakana: 6,
		FullAlpha: 7,
		HalfAlpha: 8,
		FullHangul: 9,
		HalfHangul: 10
	};
	var EDataValidationOperator = {
		Between: 0,
		NotBetween: 1,
		Equal: 2,
		NotEqual: 3,
		LessThan: 4,
		LessThanOrEqual: 5,
		GreaterThan: 6,
		GreaterThanOrEqual: 7
	};

	function checkIntegerType(val) {
		return val && AscCommonExcel.cElementType.number === val.type;
	}

	function CDataFormula(value) {
		this.text = value;
		this._formula = null;
	}

	CDataFormula.prototype._init = function (ws) {
		if (this._formula || !this.text) {
			return;
		}

		this._formula = new AscCommonExcel.parserFormula(this.text, this, ws);
		this._formula.parse();
        this._formula.buildDependencies();
	};
    CDataFormula.prototype.onFormulaEvent = function (type, eventData) {
        if (AscCommon.c_oNotifyParentType.ChangeFormula === type) {
            this.text = eventData.assemble;
        }
    };
	CDataFormula.prototype.getValue = function(ws, returnRaw) {
		this._init(ws);
		var activeCell = ws.getSelection().activeCell;
		var res = this._formula.calculate(null, new Asc.Range(activeCell.col, activeCell.row, activeCell.col, activeCell.row));
		return returnRaw ? this._formula.simplifyRefType(res) : res;
	};
	CDataFormula.prototype.Write_ToBinary2 = function(writer) {
		if (null !== this.text) {
			writer.WriteBool(true);
			writer.WriteString2(this.text);
		} else {
			writer.WriteBool(false);
		}
	};
	CDataFormula.prototype.Read_FromBinary2 = function(reader) {
		if (reader.GetBool()) {
			this.text = reader.GetString2();
		}
	};

	function CDataValidation() {
		this.ranges = null;

		this.allowBlank = false;
		this.showDropDown = false; // Excel considers this field to be a refusal to display
		this.showErrorMessage = false;
		this.showInputMessage = false;
		this.type = EDataValidationType.None;
		this.errorStyle = EDataValidationErrorStyle.Stop;
		this.imeMode = EDataValidationImeMode.NoControl;
		this.operator = EDataValidationOperator.Between;
		this.error = null;
		this.errorTitle = null;
		this.prompt = null;
		this.promptTitle = null;

		this.formula1 = null;
		this.formula2 = null;

		this.Id = AscCommon.g_oIdCounter.Get_NewId();

		return this;
	}
	CDataValidation.prototype.Get_Id = function () {
		return this.Id;
	};
	CDataValidation.prototype.getObjectType = function () {
		return AscDFH.historyitem_type_DataValidation;
	};
	CDataValidation.prototype.getType = function () {
		return AscCommonExcel.UndoRedoDataTypes.DataValidation;
	};
	CDataValidation.prototype._init = function (ws) {
		if (this.formula1) {
			this.formula1._init(ws);
		}
		if (this.formula2) {
			this.formula2._init(ws);
		}
	};
	CDataValidation.prototype.clone = function() {
		var res = new CDataValidation();
		if (this.ranges) {
			res.ranges = [];
			for (var i = 0; i < this.ranges.length; ++i) {
				res.ranges.push(this.ranges[i].clone());
			}
		}
		res.allowBlank = this.allowBlank;
		res.showDropDown = this.showDropDown;
		res.showErrorMessage = this.showErrorMessage;
		res.showInputMessage = this.showInputMessage;
		res.type = this.type;
		res.errorStyle = this.errorStyle;
		res.imeMode = this.imeMode;
		res.operator = this.operator;
		res.error = this.error;
		res.errorTitle = this.errorTitle;
		res.prompt = this.prompt;
		res.promptTitle = this.promptTitle;
		res.formula1 = this.formula1;
		res.formula2 = this.formula2;
		return res;
	};
	CDataValidation.prototype.set = function (val) {
		this.allowBlank = this.checkProperty(this.allowBlank, val.allowBlank, AscCH.historyitem_Slicer_SetCaption);
		this.showDropDown = this.checkProperty(this.showDropDown, val.showDropDown, AscCH.historyitem_Slicer_SetStartItem);
		this.showErrorMessage = this.checkProperty(this.showErrorMessage, val.showErrorMessage, AscCH.historyitem_Slicer_SetColumnCount);
		this.showInputMessage = this.checkProperty(this.showInputMessage, val.showInputMessage, AscCH.historyitem_Slicer_SetShowCaption);
		this.type = this.checkProperty(this.type, val.type, AscCH.historyitem_Slicer_SetLevel);
		this.errorStyle = this.checkProperty(this.errorStyle, val.errorStyle, AscCH.historyitem_Slicer_SetStyle);
		this.imeMode = this.checkProperty(this.imeMode, val.imeMode, AscCH.historyitem_Slicer_SetLockedPosition);
		this.operator = this.checkProperty(this.operator, val.operator, AscCH.historyitem_Slicer_SetRowHeight);
		this.error = this.checkProperty(this.error, val.error, AscCH.historyitem_Slicer_SetRowHeight);
		this.errorTitle = this.checkProperty(this.errorTitle, val.errorTitle, AscCH.historyitem_Slicer_SetRowHeight);
		this.promt = this.checkProperty(this.promt, val.promt, AscCH.historyitem_Slicer_SetRowHeight);
		this.promptTitle = this.checkProperty(this.promptTitle, val.promptTitle, AscCH.historyitem_Slicer_SetRowHeight);
		this.formula1 = this.checkProperty(this.formula1, val.formula1, AscCH.historyitem_Slicer_SetRowHeight);
		this.formula2 = this.checkProperty(this.formula2, val.formula2, AscCH.historyitem_Slicer_SetRowHeight);
	};
	CDataValidation.prototype.checkProperty = function (propOld, propNew, type) {
		if (propOld !== propNew && undefined !== propNew) {
			History.Add(AscCommonExcel.g_oUndoRedoSlicer, type,
				this.ws.getId(), null, new AscCommonExcel.UndoRedoData_Slicer(this.name, propOld, propNew));
			return propNew;
		}
		return propOld;
	};
	CDataValidation.prototype.isEqual = function(obj) {
		var errorEqual = obj.error === this.error && this.errorStyle === obj.errorStyle && this.showErrorMessage === obj.showErrorMessage;
		if (errorEqual) {
			if (obj.allowBlank === this.allowBlank && obj.showDropDown === this.showDropDown && obj.showInputMessage === this.showInputMessage) {
				if (obj.type === this.type && obj.imeMode === this.imeMode && obj.operator === this.operator && obj.prompt === this.prompt) {
					if (obj.promptTitle === this.promptTitle && obj.formula1 === this.formula1 && obj.formula2 === this.formula2) {
						return true;
					}
				}
			}
		}
		return false;
	};
	CDataValidation.prototype.Write_ToBinary2 = function (writer) {
		if (null != this.ranges) {
			writer.WriteBool(true);
			writer.WriteLong(this.ranges.length);
			for (var i = 0; i < this.ranges.length; i++) {
				writer.WriteLong(this.ranges[i].r1);
				writer.WriteLong(this.ranges[i].c1);
				writer.WriteLong(this.ranges[i].r2);
				writer.WriteLong(this.ranges[i].c2);
			}
		} else {
			writer.WriteBool(false);
		}

		writer.WriteBool(this.allowBlank);
		writer.WriteBool(this.showDropDown);
		writer.WriteBool(this.showErrorMessage);
		writer.WriteBool(this.showInputMessage);
		writer.WriteBool(this.showInputMessage);
		writer.WriteLong(this.type);
		writer.WriteLong(this.errorStyle);
		writer.WriteLong(this.imeMode);
		writer.WriteLong(this.operator);

		if(null != this.error) {
			writer.WriteBool(true);
			writer.WriteString2(this.error);
		}else {
			writer.WriteBool(false);
		}
		if(null != this.errorTitle) {
			writer.WriteBool(true);
			writer.WriteString2(this.errorTitle);
		}else {
			writer.WriteBool(false);
		}
		if(null != this.promt) {
			writer.WriteBool(true);
			writer.WriteString2(this.promt);
		}else {
			writer.WriteBool(false);
		}
		if(null != this.promptTitle) {
			writer.WriteBool(true);
			writer.WriteString2(this.promptTitle);
		}else {
			writer.WriteBool(false);
		}
		if(null != this.formula1) {
			writer.WriteBool(true);
			this.formula1.Write_ToBinary2(writer);
		}else {
			writer.WriteBool(false);
		}
		if(null != this.formula2) {
			writer.WriteBool(true);
			this.formula2.Write_ToBinary2(writer);
		}else {
			writer.WriteBool(false);
		}
	};
	CDataValidation.prototype.Read_ToBinary2 = function (reader) {
		if (reader.GetBool()) {
			var length = reader.GetULong();
			for (var i = 0; i < length; ++i) {
				var r1 = reader.GetLong();
				var c1 = reader.GetLong();
				var r2 = reader.GetLong();
				var c2 = reader.GetLong();
				this.ranges.push(new Asc.Range(c1, r1, c2, r2));			}
		}

		this.allowBlank = reader.GetBool();
		this.showDropDown = reader.GetBool();
		this.showErrorMessage = reader.GetBool();
		this.showInputMessage = reader.GetBool();
		this.showInputMessage = reader.GetBool();
		this.type = reader.GetLong();
		this.errorStyle = reader.GetLong();
		this.imeMode = reader.GetLong();
		this.operator = reader.GetLong();

		if(reader.GetBool()) {
			this.error = reader.GetString2();
		}
		if(reader.GetBool()) {
			this.errorTitle = reader.GetString2();
		}
		if(reader.GetBool()) {
			this.promt = reader.GetString2();
		}
		if(reader.GetBool()) {
			this.promptTitle = reader.GetString2();
		}
		var obj;
		if(reader.GetBool()) {
			obj = new CDataFormula();
			obj.Read_FromBinary2(reader);
			this.formula1 = obj;
		}
		if(reader.GetBool()) {
			obj = new CDataFormula();
			obj.Read_FromBinary2(reader);
			this.formula2 = obj;
		}
	};
	CDataValidation.prototype.setSqRef = function(sqRef) {
		this.ranges = AscCommonExcel.g_oRangeCache.getRangesFromSqRef(sqRef);
	};
	CDataValidation.prototype.contains = function (c, r) {
		if (this.ranges) {
			for (var i = 0; i < this.ranges.length; ++i) {
				if (this.ranges[i].contains(c, r)) {
					return true;
				}
			}
		}
		return false;
	};
	CDataValidation.prototype.containsRange = function (range) {
		if (this.ranges) {
			for (var i = 0; i < this.ranges.length; ++i) {
				if (this.ranges[i].containsRange(range)) {
					return true;
				}
			}
		}
		return false;
	};
	CDataValidation.prototype.intersection = function (range) {
		if (this.ranges) {
			for (var i = 0; i < this.ranges.length; ++i) {
				if (this.ranges[i].intersection(range)) {
					return true;
				}
			}
		}
		return false;
	};
	CDataValidation.prototype.checkValue = function (cell, ws) {
		if (!this.showErrorMessage || EDataValidationType.None === this.type) {
			return true;
		}

		var cellType = cell.getType();
		var val = cell.getValueWithoutFormat();

		if (EDataValidationType.List === this.type) {
			var list = this._getListValues(ws);
			var aValue = list[0];
			if (!aValue) {
				return false;
			}
			var aData = list[1];
			if (aData) {
				for (var i = 0; i < aData.length; ++i) {
					if (aData[i].isEqualCell(cell)) {
						return true;
					}
				}
			} else {
				return -1 !== aValue.indexOf(val);
			}
		} else if (EDataValidationType.Custom === this.type) {
			var v = this.formula1 && this.formula1.getValue(ws, true);
			v = v && v.tocBool();
			return !!(v && AscCommonExcel.cElementType.bool === v.type && v.toBool());
		} else {
			if (EDataValidationType.TextLength === this.type) {
				val = val.length;
			} else {
				if (AscCommon.CellValueType.Number !== cellType) {
					return false;
				}
				val = Number(val);

				if (isNaN(val) || (EDataValidationType.Whole === this.type && (val >> 0) !== val)) {
					return false;
				}
			}

			var v1 = this.formula1 && this.formula1.getValue(ws, true);
			var v2 = this.formula2 && this.formula2.getValue(ws, true);
			if (!checkIntegerType(v1)) {
				return false;
			}
			v1 = v1.toNumber();

			var res = false;
			switch (this.operator) {
				case EDataValidationOperator.Between:
					res = checkIntegerType(v2) && v1 <= val && val <= v2.toNumber();
					break;
				case EDataValidationOperator.NotBetween:
					res = checkIntegerType(v2) && !(v1 <= val && val <= v2.toNumber());
					break;
				case EDataValidationOperator.Equal:
					res = v1 === val;
					break;
				case EDataValidationOperator.NotEqual:
					res = v1 !== val;
					break;
				case EDataValidationOperator.LessThan:
					res = v1 > val;
					break;
				case EDataValidationOperator.LessThanOrEqual:
					res = v1 >= val;
					break;
				case EDataValidationOperator.GreaterThan:
					res = v1 < val;
					break;
				case EDataValidationOperator.GreaterThanOrEqual:
					res = v1 <= val;
					break;
			}
			return res;
		}
		return false;
	};
	CDataValidation.prototype._getListValues = function (ws) {
		var aValue, aData;
		var list = this.formula1 && this.formula1.getValue(ws, false);
		if (list && AscCommonExcel.cElementType.error !== list.type) {
			if (AscCommonExcel.cElementType.string === list.type) {
				aValue = list.getValue().split(AscCommon.FormulaSeparators.functionArgumentSeparatorDef);
			} else {
				list = list.getRange();
				if (list) {
					aValue = [];
					aData = [];
					list._foreachNoEmpty(function (cell) {
						if (!cell.isNullTextString()) {
							aValue.push(cell.getValue());
							aData.push(new AscCommonExcel.CCellValue(cell));
						}
					});
				}
			}
		}
		return [aValue, aData];
	};
	CDataValidation.prototype.isListValues = function () {
		return (this.type === EDataValidationType.List && !this.showDropDown);
	};
	CDataValidation.prototype.getListValues = function (ws) {
		return this.isListValues() ?  this._getListValues(ws) : null;
	};

	CDataValidation.prototype.getError = function () {
		return this.error;
	};
	CDataValidation.prototype.getErrorStyle = function () {
		return this.errorStyle;
	};
	CDataValidation.prototype.getErrorTitle = function () {
		return this.errorTitle;
	};
	CDataValidation.prototype.getAllowBlank = function() {
		return this.allowBlank;
	};
	CDataValidation.prototype.getShowDropDown = function() {
		return this.showDropDown;
	};
	CDataValidation.prototype.getShowErrorMessage = function() {
		return this.showErrorMessage;
	};
	CDataValidation.prototype.getShowInputMessage = function() {
		return this.showErrorMessage;
	};
	CDataValidation.prototype.getType = function() {
		return this.type;
	};
	CDataValidation.prototype.getImeMode = function() {
		return this.imeMode;
	};
	CDataValidation.prototype.getOperator = function() {
		return this.operator;
	};
	CDataValidation.prototype.getPrompt = function() {
		return this.prompt;
	};
	CDataValidation.prototype.getPromptTitle = function() {
		return this.promptTitle;
	};
	CDataValidation.prototype.getFormula1 = function() {
		return this.formula1;
	};
	CDataValidation.prototype.getFormula2 = function() {
		return this.formula2;
	};

	CDataValidation.prototype.setAllowBlank = function(newVal, addToHistory) {
		//setTableProperty(this, this.name, newVal, addToHistory, AscCH.historyitem_PivotTable_SetName);
		this.name = newVal;
	};
	CDataValidation.prototype.setAllowBlank = function(newVal, addToHistory) {
		this.allowBlank = newVal;
	};
	CDataValidation.prototype.setShowDropDown = function(newVal, addToHistory) {
		this.showDropDown = newVal;
	};
	CDataValidation.prototype.setShowErrorMessage = function(newVal, addToHistory) {
		this.showErrorMessage = newVal;
	};
	CDataValidation.prototype.setShowInputMessage = function(newVal, addToHistory) {
		this.showErrorMessage = newVal;
	};
	CDataValidation.prototype.setType = function(newVal, addToHistory) {
		this.type = newVal;
	};
	CDataValidation.prototype.setErrorStyle = function(newVal, addToHistory) {
		this.errorStyle = newVal;
	};
	CDataValidation.prototype.setImeMode = function(newVal, addToHistory) {
		this.imeMode = newVal;
	};
	CDataValidation.prototype.setOperator = function(newVal, addToHistory) {
		this.operator = newVal;
	};
	CDataValidation.prototype.setError = function(newVal, addToHistory) {
		this.error = newVal;
	};
	CDataValidation.prototype.setErrorTitle = function(newVal, addToHistory) {
		this.errorTitle = newVal;
	};
	CDataValidation.prototype.setPrompt = function(newVal, addToHistory) {
		this.prompt = newVal;
	};
	CDataValidation.prototype.setPromptTitle = function(newVal, addToHistory) {
		this.promptTitle = newVal;
	};
	CDataValidation.prototype.setFormula1 = function(newVal, addToHistory) {
		this.formula1 = newVal;
	};
	CDataValidation.prototype.setFormula2 = function(newVal, addToHistory) {
		this.formula2 = newVal;
	};

	function CDataValidations() {
		this.disablePrompts = false;
		this.xWindow = null;
		this.yWindow = null;

		this.elems = [];

		return this;
	}

	CDataValidations.prototype.init = function (ws) {
		for (var i = 0; i < this.elems.length; ++i) {
			this.elems[i]._init(ws);
		}
	};
	CDataValidations.prototype.clone = function() {
		var i, res = new CDataValidations();
		res.disablePrompts = this.disablePrompts;
		res.xWindow = this.xWindow;
		res.yWindow = this.yWindow;
		for (i = 0; i < this.elems.length; ++i) {
			res.elems.push(this.elems[i].clone());
		}
		return res;
	};

	/*
	 * Export
	 * -----------------------------------------------------------------------------
	 */
	var prot;
	window['Asc'] = window['Asc'] || {};
	window['Asc']['c_oAscEDataValidationType'] = window['Asc'].EDataValidationType = EDataValidationType;
	prot = EDataValidationType;
	prot['None'] = prot.None;
	prot['Custom'] = prot.Custom;
	prot['Date'] = prot.Date;
	prot['Decimal'] = prot.Decimal;
	prot['List'] = prot.List;
	prot['TextLength'] = prot.TextLength;
	prot['Time'] = prot.Time;
	prot['Whole'] = prot.Whole;

	window['Asc']['c_oAscEDataValidationErrorStyle'] = window['Asc'].EDataValidationErrorStyle = EDataValidationErrorStyle;
	prot = EDataValidationErrorStyle;
	prot['Stop'] = prot.Stop;
	prot['Warning'] = prot.Warning;
	prot['Information'] = prot.Information;

	window['Asc'].EDataValidationImeMode = EDataValidationImeMode;

	window['AscCommonExcel'] = window['AscCommonExcel'] || {};
	window['AscCommonExcel'].CDataFormula = CDataFormula;
	window['AscCommonExcel'].CDataValidation = CDataValidation;
	prot = CDataValidation.prototype;
	prot['asc_getError'] = prot.getError;
	prot['asc_getErrorStyle'] = prot.getErrorStyle;
	prot['asc_getErrorTitle'] = prot.getErrorTitle;
	prot['asc_getErrorTitle'] = prot.getErrorTitle;
	prot['asc_getAllowBlank'] = prot.getAllowBlank;
	prot['asc_getShowDropDown'] = prot.getShowDropDown;
	prot['asc_getShowErrorMessage'] = prot.getShowErrorMessage;
	prot['asc_getType'] = prot.getType;
	prot['asc_getImeMode'] = prot.getImeMode;
	prot['asc_getOperator'] = prot.getOperator;
	prot['asc_getPrompt'] = prot.getPrompt;
	prot['asc_getPromptTitle'] = prot.getPromptTitle;
	prot['asc_getFormula1'] = prot.getFormula1;
	prot['asc_getFormula2'] = prot.getFormula2;

	prot['asc_setError'] = prot.setError;
	prot['asc_setErrorStyle'] = prot.setErrorStyle;
	prot['asc_setErrorTitle'] = prot.setErrorTitle;
	prot['asc_setErrorTitle'] = prot.setErrorTitle;
	prot['asc_setAllowBlank'] = prot.setAllowBlank;
	prot['asc_setShowDropDown'] = prot.setShowDropDown;
	prot['asc_setShowErrorMessage'] = prot.setShowErrorMessage;
	prot['asc_setType'] = prot.setType;
	prot['asc_setImeMode'] = prot.setImeMode;
	prot['asc_setOperator'] = prot.setOperator;
	prot['asc_setPrompt'] = prot.setPrompt;
	prot['asc_setPromptTitle'] = prot.setPromptTitle;
	prot['asc_setFormula1'] = prot.setFormula1;
	prot['asc_setFormula2'] = prot.setFormula2;

	window['Asc']['EDataValidationType'] = window['Asc'].EDataValidationType = EDataValidationType;
	prot = EDataValidationType;
	prot['None'] = prot.None;
	prot['Date'] = prot.Date;
	prot['Decimal'] = prot.Decimal;
	prot['List'] = prot.List;
	prot['TextLength'] = prot.TextLength;
	prot['Time'] = prot.Time;
	prot['Whole'] = prot.Whole;

	window['Asc']['EDataValidationOperator'] = window['Asc'].EDataValidationOperator = EDataValidationOperator;
	prot = EDataValidationOperator;
	prot['Between'] = prot.Between;
	prot['NotBetween'] = prot.NotBetween;
	prot['Equal'] = prot.Equal;
	prot['NotEqual'] = prot.NotEqual;
	prot['LessThan'] = prot.LessThan;
	prot['LessThanOrEqual'] = prot.LessThanOrEqual;
	prot['GreaterThan'] = prot.GreaterThan;
	prot['GreaterThanOrEqual'] = prot.GreaterThanOrEqual;

	window['AscCommonExcel'].CDataValidations = CDataValidations;
})(window);
