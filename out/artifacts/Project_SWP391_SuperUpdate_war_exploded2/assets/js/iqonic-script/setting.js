/*-----------------------------
 * Functions
 * - init
 * - reInit
 * - destroy
 * - storageGet
 * - storageSet
 * - storageRemove
 * - UpdateOption
 * - setSettingOption
 * - UpdateOptionFromStorage
 * - CustomEvent for updateOption
 * - CustomEvent for updateOptionFromStorage
 * - setDefault option Soon
 * - addListeners
   * - radioListener
   * - checkboxListener
   * - attribuiteListener
   * - styleListener
 * - removeListeners
    * - radioListener
    * - checkboxListener
    * - attribuiteListener
    * - styleListener
 * - addClass
 * - removeClass
 * - toggleClass
 * - observeStorage:  https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
-----------------------------*/

/*************************
 * Lodash functions use
 * https://lodash.com/docs/4.17.15#functions
 *  function list:
    - _.keys
    - _.has
    - _.findKey
    - _.find
    - _.forEach
    - _.isObject
    - _.isArray
    - _.isString
 * ***********************/

/****** Incomplete Points
 * Color Customizer with color pallet & Custom Color
 * Font Family by root variables
 * FOOTER FIXED
 - position: STICKY;
 - bottom: 0;
 * ***/
(function (window) {
  // Listners for Customizer

  const selectors = {
    radio: document.querySelectorAll('[data-setting="radio"]'),
    checkbox: document.querySelectorAll('[data-setting="checkbox"]'),
    attribute: document.querySelectorAll('[data-setting="attribute"]'),
    style: document.querySelectorAll('[data-setting="style"]'),
    input: document.querySelectorAll('[data-setting="input"]'),
    select: document.querySelectorAll('[data-setting="select"]'),
    color: document.querySelectorAll('[data-setting="color"]'),
  };

  /**************************************************************************
   * Default Object for setting Start
   * **********************************************************************/

  const defaults = defaultSetting();

  function defaultSetting() {
    return {
      saveLocal: "sessionStorage", // sessionStorage, localStorage, null
      storeKey: "kivicare",
      setting: defaultSettingOption(),
      beforeInit: function (cb) {
        return cb;
      },
      afterInit: function (cb) {
        return cb;
      },
    };
  }

  function defaultSettingOption() {
    return {
      app_name: {
        target: '[data-setting="app_name"]',
        type: "text",
        value: "Kivicare",
      },

      theme_scheme_direction: {
        target: "html",
        choices: ["ltr", "rtl"],
        value: "ltr",
      },

      theme_style_appearance: {
        target: "html",
        choices: ["light", "dark"],
        value: ["light"],
      },

    };
  }

  /**************************************************************************
   * Default Object for setting End
   * **********************************************************************/

  // Main function
  this.IQSetting = function (opt) {
    this.options = {};

    this.arg = opt;

    this.extend(defaults);

    this.getStorageValue(this.options.storeKey);

    this.updateOptionFromStorage();



    if (_.isFunction(this.options.beforeInit)) {
      this.options.beforeInit(this);
    }

    this.init();


    let page_colors = document.querySelector('meta[name="page_colors"]')?.getAttribute("content")
    if (page_colors !== null && page_colors !== undefined && page_colors.length > 0) {
      page_colors = JSON.parse(page_colors);
      if (page_colors !== undefined && page_colors.length > 0) {
        page_colors?.forEach((currentValue, index, arr) => {
          document.querySelector("html").style.setProperty(currentValue.var, currentValue.value)
        })
      }
    }


    if (_.isFunction(this.options.afterInit)) {
      this.options.afterInit(this);
    }

    this.addListeners();

    return this;
  };

  /**************************************************************************
   * Initialize Functions Start
   * **********************************************************************/

  // extend object function to the IQSetting prototype
  IQSetting.prototype.extend = function (defaults) {
    // Create options by extending defaults with the passed in arugments
    if (this.arg && _.isObject(this.arg)) {
      this.options = IQUtils.mergeDeep(defaults, this.arg);
    } else {
      this.options = defaults;
    }
  };

  // Function call by parameter to the IQSetting prototype
  IQSetting.prototype.fnCall = function (
    key,
    value = this.getSettingKey(key).value
  ) {
    if (_.isString(key)) {
      if (
        this.__proto__.hasOwnProperty(key) &&
        _.isFunction(this.__proto__[key])
      ) {
        this.__proto__[key].call(this, value);
      }
    }
  };

  // Init function to the IQSetting prototype
  IQSetting.prototype.init = function () {
    const keys = _.keys(this.options.setting);
    console.log(this.options);
    _.forEach(keys, (key) => {
      this.fnCall(key);
    });

    this.saveOption();
  };

  // reInit function to the IQSetting prototype
  IQSetting.prototype.reInit = function () {
    this.destroy();
    this.extend(defaultSetting());
    this.saveLocal(this.options.saveLocal);
    this.init();
    this.afterUpdate("reinit", this.options);
  };

  // After Update function to the IQSetting Prototype
  IQSetting.prototype.afterUpdate = function (
    key,
    value,
    currentValue = ''
  ) {
    const event = new CustomEvent(key, { detail: { value: value, name: key, currentValue: currentValue } });
    document.dispatchEvent(event);
    this.saveOption();
  };

  // Destroy function to the IQSetting prototype
  IQSetting.prototype.destroy = function () {
    this.removeListeners();
  };

  // addListeners function to the IQSetting prototype
  IQSetting.prototype.addListeners = function (elems, key) {
    this.addRadioListener();
    this.addCheckboxListener();
    this.addAttributeListener();
    this.addStyleListener();
    this.addInputListener();
    this.addSelectListener();
  };

  // removeListeners function to the IQSetting prototype
  IQSetting.prototype.removeListeners = function (elems, key) {
    this.removeRadioListeners();
    this.removeCheckboxListeners();
    this.removeAttributeListeners();
    this.removeStyleListeners();
    this.removeInputListeners();;
  };

  /**************************************************************************
   * Initialize Functions End
   * **********************************************************************/

  /**************************************************************************
   * Get Value Functions Start
   * **********************************************************************/

  // Update option key values to the IQSetting
  IQSetting.prototype.setMainOption = function (key, value) {
    this.options[key] = value;
  };

  // get setting options function to the IQSetting prototype
  IQSetting.prototype.getSettingOptions = function () {
    return this.options.settings;
  };

  // get Setting key function to the IQSetting prototype
  IQSetting.prototype.getSettingKey = function (key) {
    return this.options.setting[key];
  };

  // Update option setting key values to the IQSetting
  IQSetting.prototype.setSettingOption = function (key, value, manual) {
    if (manual) {
      this.options.setting[key].value = value;
    }
  };

  // Update theme color custom choise object to the IQSetting
  this.IQSetting.prototype.setSettingColorChoice = function (key, pair) {
    this.options.setting[key].colors[pair.key] = pair.value;
  };

  // get option json function to the IQSetting prototype
  IQSetting.prototype.getSettingJson = function () {
    const self = this;
    const json = {};
    Object.keys(self.options).forEach(function (key) {
      if (key !== "afterInit" && key !== "beforeInit") {
        json[key] = self.options[key];
        if (key === "setting") {
          Object.keys(json[key]).forEach(function (subKey) {
            delete json[key][subKey].target;
            delete json[key][subKey].type;
            delete json[key][subKey].choices;
          });
        }
      }
    });
    this.options = IQUtils.mergeDeep(defaults, json);
    return JSON.stringify(json, null, 4);
  };

  // Static method to get the instance of the IQSetting
  IQSetting.getInstance = function () {
    if (!IQSetting.instance) {
      IQSetting.instance = new IQSetting();
    }
    return IQSetting.instance;
  };

  /**************************************************************************
   * Get Value Functions End
   * **********************************************************************/

  /**************************************************************************
   * Storage get & update Functions Start
   * **********************************************************************/

  // function for save option in localStorage or sessionStorage based on options
  IQSetting.prototype.saveOption = function () {
    const key = this.options.storeKey;
    const value = this.options;
    if (typeof value !== typeof undefined && typeof key !== typeof undefined) {
      switch (this.options.saveLocal) {
        case 'localStorage':
          sessionStorage.removeItem(key)
          return IQUtils.saveLocalStorage(key, JSON.stringify(value))
          break

        case 'sessionStorage':
          localStorage.removeItem(key)
          return IQUtils.saveSessionStorage(key, JSON.stringify(value))
          break

        case "cookieStorage":
          return IQUtils.setCookie(key, JSON.stringify(value));
          break;

        default:
          break
      }
    }
    localStorage.setItem(key, 'none')
    sessionStorage.setItem(key, 'none')
  };

  // function for get option in localStorage or sessionStorage based on options
  IQSetting.prototype.getOption = function (key) {
    if (localStorage.getItem(key) === 'none' || sessionStorage.getItem(key) === 'none') return 'none'
    if ((localStorage.getItem(key) !== null && localStorage.getItem(key) !== '') || (sessionStorage.getItem(key) !== null && sessionStorage.getItem(key) !== '')) {
      let value = localStorage.getItem(key)
      if (value === null) value = sessionStorage.getItem(key)
      if (value !== null) {
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      }
    }
  };

  // function for update option from localStorage or sessionStorage based on options
  IQSetting.prototype.updateOptionFromStorage = function () {
    const getData = this.getOption(this.options.storeKey)
    if (getData === 'none') {
      return this.options.saveLocal = 'none'
    }
    if (getData !== undefined) {
      this.options = getData
    }
    return this.options
  };

  // function for get storage value if exists
  IQSetting.prototype.getStorageValue = function (key) {
    const checkKey = IQUtils.checkStorageArray(key, [
      "localStorage",
      "sessionStorage",
      "cookieStorage",
      "none"
    ]);
    let defaultstorage = this.options.saveLocal
    if (checkKey.result) {
      defaultstorage = checkKey.storage
    }
    IQUtils.getElems(`input[name="saveLocal"]`).forEach(function (el) {
      el.checked = false;
      if (el.value === defaultstorage) {
        el.checked = true;
      }
    });
  };

  /**************************************************************************
   * Storage get & update Functions End
   * **********************************************************************/

  /**************************************************************************
   * Input Update Functions Start
   * **********************************************************************/

  // Input radio input manually change function to the IQSetting prototype
  IQSetting.prototype.__radioInputChange__ = function (key) {
    const obj = this.getSettingKey(key);
    IQUtils.getElems(`input[name="${key}"]`).forEach(function (el) {
      el.checked = false;
      if (el.value === obj.value) {
        el.checked = true;
      }
    });
  };
  // Input checkbox input manually change function to the IQSetting prototype
  IQSetting.prototype.__checkboxInputChange__ = function (key) {
    const obj = this.getSettingKey(key);
    IQUtils.getElems(`input[name="${key}"]`).forEach(function (el) {
      el.checked = false;
      if (obj.value.indexOf(el.value) !== -1) {
        el.checked = true;
      }
    });
  };
  // Input manually change function to the IQSetting prototype
  IQSetting.prototype.__inputChange__ = function (key, value) {
    IQUtils.getElems(`input[name="${key}"]`).forEach(function (el) {
      el.value = value;
    });
  };
  // Select input update manually change function to the IQSetting prototype
  IQSetting.prototype.__selectInputChange__ = function (key) {
    const obj = this.getSettingKey(key);
    IQUtils.getElems(`select[name="${key}"]`).forEach(function (el) {
      el.value = obj.value;
    });
    if (typeof $ !== typeof undefined) {
      $(`[data-select="font"][name="${key}"]`).val(obj.value).trigger("change");
    }
  };

  /**************************************************************************
   * Input Update Functions End
   * **********************************************************************/

  /**************************************************************************
   * Dom & Object Update Functions Start
   * IQSetting.options update functions saveLocal, setting:key, value etc...
   * **********************************************************************/

  // radio update function to the IQSetting prototype
  IQSetting.prototype.__radioUpdate__ = function (key, value, cb) {
    const obj = this.getSettingKey(key);
    if (value !== null) {
      obj.value = value;
      this.setSettingOption(key, value);
    }
    if (obj.target !== null) {
      obj.choices.forEach((other) => {
        IQUtils.removeClass(obj.target, ...other.split(' '));
      });
      IQUtils.addClass(obj.target, ...value.split(' '));
    }
    this.__radioInputChange__(key);
    if (_.isFunction(cb)) {
      cb(key, value, obj);
    }
    this.afterUpdate(key, value);
  };

  // style update function to the IQSetting prototype
  IQSetting.prototype.__styleUpdate__ = function (
    key,
    pair = { prop: "", value: "value" },
    cb
  ) {
    const obj = this.getSettingKey(key);
    if (pair.value !== null) {
      obj.value = pair.value;
      this.setSettingOption(key, pair.value);
    }
    if (obj.target !== null) {
      IQUtils.setStyle(obj.target, pair);
    }
    this.__radioInputChange__(key);
    if (_.isFunction(cb)) {
      cb(key, pair.value);
    }
    this.afterUpdate(key, pair);
  };

  // attribute update function to the IQSetting prototype
  IQSetting.prototype.__attributeUpdate__ = function (
    key,
    pair = { prop: "color", value: "value" },
    cb
  ) {
    const obj = this.getSettingKey(key);
    if (pair.value !== null) {
      obj.value = pair.value;
      this.setSettingOption(key, pair.value);
    }
    if (obj.target !== null) {
      IQUtils.setAttr(obj.target, pair);
    }
    this.__radioInputChange__(key);
    if (_.isFunction(cb)) {
      cb(key, pair.value);
    }
    this.afterUpdate(key, pair);
  };

  // checkbox update function to the IQSetting Prototype
  IQSetting.prototype.__checkboxUpdate__ = function (key, value, currentValue, cb) {
    const obj = this.getSettingKey(key);
    if (value !== null) {
      obj.value = value;
      this.setSettingOption(key, value);
    }
    if (obj.target !== null) {
      obj.choices.forEach((other) => {
        IQUtils.removeClass(obj.target, other);
      });
      if (obj.value.length) {
        obj.value.forEach((objValue) => {
          IQUtils.addClass(obj.target, objValue);
        });
      }
    }
    this.__checkboxInputChange__(key);
    if (_.isFunction(cb)) {
      cb(key, value);
    }
    this.afterUpdate(key, value, currentValue);
  };

  // input update function to the IQSetting Prototype
  IQSetting.prototype.__inputUpdate__ = function (key, value, cb) {
    const obj = this.getSettingKey(key);
    if (value !== null) {
      obj.value = value;
      this.setSettingOption(key, value);
    }
    if (obj.target !== null) {
      IQUtils.setContent(obj.target, value.substr(0, 10));
    }
    this.__inputChange__(key, value);
    if (_.isFunction(cb)) {
      cb(key, value);
    }
    this.afterUpdate(key, value);
  };

  // Update theme color & custom color to the IQSetting Prototype
  IQSetting.prototype.__updateThemeColor__ = function (key, value) {
    const obj = this.getSettingKey(key);
    if (value !== null) {
      obj.value = value;
      this.setSettingOption(key, value);
    }
    if (obj.target !== null) {
      obj.choices.forEach((other) => {
        IQUtils.removeClass(obj.target, other);
      });
      if (obj.value !== "custom") {
        this.resetColor(key);
      }
      if (!_.isObject(obj.value)) {
        _.forEach(obj.colors, (value, index) => {
          if (
            IQUtils.getElem(
              `[data-extra="${index.replace("--{{prefix}}", "")}"]`
            ) !== null
          ) {
            IQUtils.getElem(
              `[data-extra="${index.replace("--{{prefix}}", "")}"]`
            ).value = value;
          }
          this.setSettingColorChoice(key, {
            key: index,
            value: value,
          });
        });
        let prefix = IQUtils.getRootVars("--prefix") || "bs-";
        let newColors = {};
        // const theme_scheme = this.getSettingKey('theme_scheme');
        let dark = false
        // if (theme_scheme.value !== 'light' && theme_scheme.value !== 'auto') {
        //   dark = true
        // }

        _.forEach(obj.colors, (value, key) => {
          key = key.replace("{{prefix}}", prefix);
          newColors = {
            ...newColors,
            ...IQUtils.getColorShadeTint(key, value, dark),
          };
        });
        IQUtils.setRootVariables(newColors);
        IQUtils.addClass("body", obj.value);
        switch (obj.type) {
          case "default":
            IQUtils.removeClass("body", obj.value);
            IQUtils.removeRootVariables(newColors);
            break;
          default:
            break;
        }
      }
    }
    this.__radioInputChange__(key);
    this.afterUpdate(key, value);
  };

  // Update font function to the IQSetting Prototype
  IQSetting.prototype.__selectUpdate__ = function (key, value) {
    const obj = this.getSettingKey(key);
    if (value !== null) {
      obj.value = value;
      this.setSettingOption(key, value);
    }
    if (obj.target !== null) {
      IQUtils.setFontFamily(value, obj.target);
    }
    this.__selectInputChange__(key);
    this.afterUpdate(key, value);
  };

  // Update option function to the IQSetting Prototype
  IQSetting.prototype.__updateOption__ = function (key, value) {
    this.setMainOption(key, value);
    this.saveOption();
    this.updateOptionFromStorage();
  };

  /**************************************************************************
   * Dom & Object Update Functions End
   * **********************************************************************/

  /**************************************************************************
   * Add Listener Functions Start
   * **********************************************************************/

  // Add radio event listener to the IQSetting prototype
  IQSetting.prototype.addRadioListener = function (cb) {
    const self = this;
    selectors.radio.forEach(function (item) {
      item.addEventListener("change", function (e) {
        const value = e.target.value;
        const key = e.target.getAttribute("name");
        self.__proto__[key].call(self, value);
        if (_.isFunction(cb)) {
          cb();
        }
      });
    });
  };

  // Add checkbox event listener to the IQSetting Prototype
  IQSetting.prototype.addCheckboxListener = function (cb) {
    const self = this;

    // add event listener to all setting checkboxes
    selectors.checkbox.forEach(function (item) {
      item.addEventListener("change", (e) => {
        const values = [];
        const key = e.target.getAttribute("name");

        // checkbox values get from domElement
        const checkboxElements = document.querySelectorAll(`[name="${key}"]`);
        checkboxElements.forEach(function (item) {
          if (item.checked) {
            values.push(item.value);
          }
        });

        // Update dom values based on checkbox
        self.__proto__[key].call(self, values, e.target.value);
        if (_.isFunction(cb)) {
          cb();
        }
      });
    });
  };

  // Add style event listener to the IQSetting Prototype
  IQSetting.prototype.addStyleListener = function (cb) {
    const self = this;

    // add event listener for inline style
    selectors.style.forEach(function (item) {
      item.addEventListener("change", function (e) {
        const value = e.target.value;
        const key = e.target.getAttribute("name");
        const pair = {
          prop: e.target.getAttribute("data-prop"),
          value: value,
        };

        // Update dom values based on style
        self.__proto__[key].call(self, pair.value);
        if (_.isFunction(cb)) {
          cb();
        }
      });
    });
  };

  // Add attribute event listener to the IQSetting Prototype
  IQSetting.prototype.addAttributeListener = function (cb) {
    const self = this;
    selectors.attribute.forEach(function (item) {
      // add event listener for attribute change
      item.addEventListener("change", function (e) {
        const value = e.target.value;
        const key = e.target.getAttribute("name");
        const pair = {
          prop: e.target.getAttribute("data-prop"),
          value: value,
        };
        // Update dom values based on attribute
        self.__proto__[key].call(self, pair.value);
        if (_.isFunction(cb)) {
          cb();
        }
      });
    });
  };

  // Add input event listener to the IQSetting Prototype
  IQSetting.prototype.addInputListener = function (cb) {
    const self = this;
    selectors.input.forEach(function (item) {
      // add event listener for input change
      item.addEventListener("input", function (e) {
        const value = e.target.value || "";
        const key = e.target.getAttribute("name");
        self.__proto__[key].call(self, value);
        if (_.isFunction(cb)) {
          cb();
        }
      });
    });
  };

  // Add select event listener to the IQSetting Prototype
  IQSetting.prototype.addSelectListener = function (cb) {
    const self = this;
    selectors.select.forEach(function (item) {
      // add event listener for select change
      if (typeof $ !== typeof undefined) {
        $(item).on("select2:select", (e) => {
          const value = e.params.data.id;
          const key = e.target.getAttribute("name");
          self.__proto__[key].call(self, value);
          if (_.isFunction(cb)) {
            cb();
          }
        });
      }
    });
  };


  /**************************************************************************
   * Add Listener Functions End
   * **********************************************************************/

  /**************************************************************************
   * Remove Listener Functions Start
   * **********************************************************************/

  // remove radio listeners function to the IQSetting prototype
  IQSetting.prototype.removeRadioListeners = function () {
    selectors.radio.forEach(function (item) {
      item.removeEventListener("change", null);
    });
  };

  // remove checkbox listeners function to the IQSetting prototype
  IQSetting.prototype.removeCheckboxListeners = function () {
    selectors.checkbox.forEach(function (item) {
      item.removeEventListener("change", null);
    });
  };

  // remove style listeners function to the IQSetting prototype
  IQSetting.prototype.removeStyleListeners = function () {
    selectors.style.forEach(function (item) {
      item.removeEventListener("change", null);
    });
  };

  // remove attribute listeners function to the IQSetting prototype
  IQSetting.prototype.removeAttributeListeners = function () {
    selectors.attribute.forEach(function (item) {
      item.removeEventListener("change", null);
    });
  };

  // remove input listeners function to the IQSetting prototype
  IQSetting.prototype.removeInputListeners = function () {
    selectors.input.forEach(function (item) {
      item.removeEventListener("change", null);
    });
  };

  // remove select listeners function to the IQSetting prototype
  IQSetting.prototype.removeSelectListeners = function () {
    selectors.select.forEach(function (item) {
      if (typeof $ !== typeof undefined) {
        $(item).off("select2:select", null);
      }
    });
  };

  /**************************************************************************
   * Remove Listener Functions End
   * **********************************************************************/



  // 0. Set app name function to the IQSetting prototype @param {string} appName
  IQSetting.prototype.app_name = function (value) {
    if (typeof value !== typeof null) {
      this.__inputUpdate__("app_name", value);
    }
  };

  // 16. card_color function to the IQSetting prototype @params: value (string)
  IQSetting.prototype.card_color = function (value) {
    if (typeof value !== typeof null) {
      this.__radioUpdate__("card_color", value);
    }
  };

  // 17. page_layout function to the IQSetting prototype @params: value (string)
  IQSetting.prototype.page_colors = function (value) {

    if (typeof value !== typeof null) {
      Object.values(this.options.setting.page_colors).forEach((currentValue, index, arr) => {
        document.querySelector("html").style.setProperty(currentValue.var, currentValue.value)
      })
    }
  };

  // saveLocal function to the IQSetting prototype value (string)
  IQSetting.prototype.saveLocal = function (value = null) {
    if (value !== null) {
      this.__updateOption__("saveLocal", value);
    }
  };

  /**************************************************************************
   * Additional Functions Start
   * **********************************************************************/
  // Rtl Change to Offcanvas left to right Static Function
  IQSetting.prototype.rtlChange = function (check) {
    IQUtils.addClass(".offcanvas-start", "on-rtl", "start");
    IQUtils.addClass(".offcanvas-end", "on-rtl", "end");
    if (check) {
      IQUtils.addClass(".on-rtl.start", "offcanvas-end");
      IQUtils.removeClass(".on-rtl.start", "offcanvas-start");
      IQUtils.addClass(".on-rtl.end", "offcanvas-start");
      IQUtils.removeClass(".on-rtl.end", "offcanvas-end");
    } else {
      IQUtils.addClass(".on-rtl.start", "offcanvas-start");
      IQUtils.removeClass(".on-rtl.start", "offcanvas-end");
      IQUtils.addClass(".on-rtl.end", "offcanvas-end");
      IQUtils.removeClass(".on-rtl.end", "offcanvas-start");
    }
  };

  // theme_scheme_direction function to the IQSetting prototype @params: value (string)
  IQSetting.prototype.theme_scheme_direction = function (value) {
    if (typeof value !== typeof null) {
      const __this = this;
      this.__attributeUpdate__(
        "theme_scheme_direction",
        { prop: "dir", value: value },
        function (key, val) {
          __this.rtlChange(val == "rtl" ? true : false);
        }
      );
    }
  };

  // theme_style_appearance function to the IQSetting prototype @params: value (string)
  IQSetting.prototype.theme_style_appearance = function (value, currentValue) {
    if (value !== null) {
      this.__attributeUpdate__("theme_style_appearance", {
        prop: "data-bs-theme",
        value: value,
      });
    }
  };

  // saveLocal function to the IQSetting prototype value (string)
  IQSetting.prototype.saveLocal = function (value = null) {
    if (value !== null) {
      this.__updateOption__("saveLocal", value);
    }
  };



  /**************************************************************************
   * Additional Functions End
   * **********************************************************************/

  // Export the IQSetting
  window.IQSetting = this.IQSetting;

  // reset font color
  const resetFont = document.querySelector('[data-reset="body-heading-font"]');
  if (resetFont !== null) {
    resetFont.addEventListener("click", (e) => {
      e.preventDefault();
      this.IQSetting.setSettingOption("body_font_family", "Inter", true);
      this.IQSetting.setSettingOption("heading_font_family", "Inter", true);
      this.IQSetting.resetFontFamily();
    });
  }

  return window.IQSetting;
})(window);
