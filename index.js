// File: index.js
// Name: Samuel Claflin
// Email: samuel_claflin@student.uml.edu 
// Date: 11/23/2022 

// Strict
"use strict";

// Constants
const INTEGER_MESSAGE = "Please enter an integer";
const LESS_THAN_MESSAGE = "Please ensure that the minimum is less than the maximum";
const TAB_CONTROL_LIST_ITEM_SELECTED_CLASS = "tab-control-list-item-selected"
const TABLE_MIN = -50;
const TABLE_MAX = 50;
const NUMERIC_RULES = {
    required: true,
    integer: true,
    range: [TABLE_MIN, TABLE_MAX]
};
const MINIMUM_MESSAGES = {
    integer: INTEGER_MESSAGE,
    lessThan: LESS_THAN_MESSAGE
};
const MAXIMUM_MESSAGES = {
    integer: INTEGER_MESSAGE
};
const SLIDER_RULES = {
    min: TABLE_MIN,
    max: TABLE_MAX,
    val: 0
};

// Globals
let initialScrollPosition = 0;

// Entry point
const main = () => {
    showHideTabControlPopup(false);
    showHideTabContainer(false);
    initializeJQuerySliders();
    initializeJQueryRules();
    validateMainForm();
};

// Converts particular divs into sliders
const initializeJQuerySliders = () => {
    // Initialization
    const idPairs = [
        ["multiplier-minimum-slider", "multiplier-minimum"],
        ["multiplier-maximum-slider", "multiplier-maximum"],
        ["multiplicand-minimum-slider", "multiplicand-minimum"],
        ["multiplicand-maximum-slider", "multiplicand-maximum"]
    ];

    // Convert all required divs into sliders
    idPairs.forEach(idPair => {
        // Create sliders
        $(`#${idPair[0]}`).slider({
            ...SLIDER_RULES,
            slide: (_, ui) => {
                // Set the value
                $(`#${idPair[1]}`).val(ui.value);

                // Regenerate the table dynamically
                $("#main-form").submit();
            }
        });

        // Initialize the inputs' values
        $(`#${idPair[1]}`)
            .val($(`#${idPair[0]}`)
            .slider("option", "value"));

        // Enable two-way binding
        $(`#${idPair[1]}`).change(() => {
            const newVal = $(`#${idPair[1]}`).val();
            if (!isNaN(newVal) && newVal >= TABLE_MIN && newVal <= TABLE_MAX) {
                // Set the value
                $(`#${idPair[0]}`).slider("option", "value", newVal);

                // Regenerate the main table dynamically
                $("#main-form").submit();
            }
        });
    });
};

// Converts the tab container into a JQuery tab component
const initializeJQueryTabs = () => {
    // Ensure that the tab container has been initialized prior to attempting to destroy it
    $("#tab-container").tabs();

    // Clear out the current contents of the tab container
    $("#tab-container").tabs("destroy");

    // Re-generate the tab container
    $("#tab-container").tabs();
};

// Adds all custom rules to the JQuery Validator
const initializeJQueryRules = () => {
    // Ensure that values are integers
    jQuery.validator.addMethod("integer", (value, _) => {
        const num = +value;
        return isInt(num);
    });

    // Ensure that minimums are less than corresponding maximums
    jQuery.validator.addMethod("lessThan", (value, _, otherId) => {
        const num = +value;
        const otherNum = +($(`#${otherId}`).val());
        return !isInt(num) || !isInt(otherNum) || num < otherNum;
    });
};

// Validates the main form prior to its submission
const validateMainForm = () => {
    $("#main-form").validate({
        // Callbacks
        submitHandler: (form, event) => handleMainFormSubmit(form, event),

        // Configuration
        rules: {
            "multiplier-minimum": {
                ...NUMERIC_RULES,
                lessThan: "multiplier-maximum"
            },
            "multiplier-maximum": {
                ...NUMERIC_RULES
            },
            "multiplicand-minimum": {
                ...NUMERIC_RULES,
                lessThan: "multiplicand-maximum"
            },
            "multiplicand-maximum": {
                ...NUMERIC_RULES
            }
        },
        messages: {
            "multiplier-minimum": {
                ...MINIMUM_MESSAGES
            },
            "multiplier-maximum": {
                ...MAXIMUM_MESSAGES
            },
            "multiplicand-minimum": {
                ...MINIMUM_MESSAGES
            },
            "multiplicand-maximum": {
                ...MAXIMUM_MESSAGES
            }
        }
    });
};

// Main form submit callback
const handleMainFormSubmit = (_, event) => {
    // Prevent page reload
    event.preventDefault();
    
    // Generate the multiplication table
    generateTable();
};

// Generates the HTML required to render the table
const generateTable = () => {
    // Retrieve all minimums and maximums
    const multiplierMin = parseInt($("#multiplier-minimum").val());
    const multiplierMax = parseInt($("#multiplier-maximum").val());
    const multiplicandMin = parseInt($("#multiplicand-minimum").val());
    const multiplicandMax = parseInt($("#multiplicand-maximum").val());

    // Generate ranges
    const multiplierRange = generateRange(multiplierMin, multiplierMax);
    const multiplicandRange = generateRange(multiplicandMin, multiplicandMax);

    // Initialization
    let tableHtml = `<tr><td></td>`;

    // Generate the header row
    multiplierRange.forEach((multiplier) => {
        // Add the current cell to the table
        let currMultiplier = `<td>${multiplier}</td>`;
        tableHtml += currMultiplier;
    });

    // Iterate over all multiplicands 
    multiplicandRange.forEach(multiplicand => {
        // Initialize the current row
        let currRow = "<tr>";

        // Append each multiplicand to the leftmost column
        currRow += `<td>${multiplicand}</td>`;

        // Iterate over all multiplicands
        multiplierRange.forEach(multiplier => {
            // Perform the multiplication and append the result to the current row 
            currRow += `<td>${multiplier * multiplicand}</td>`;
        });

        // Add the current row to the new HTML 
        currRow += "</tr>";
        tableHtml += currRow
    });

    // Render the table
    const tableName = `[${multiplierMin}, ${multiplierMax}], [${multiplicandMin}, ${multiplicandMax}]`
    renderTable(tableName, tableHtml);
};

// Renders the table based on provided HTML
const renderTable = (tableName, tableHtml) => {
    // Generate an ID for the new table
    const tableId = Date.now();

    // Append the new tab to the tab container
    appendTab(tableId, tableName);

    // Append the new table to the tab container
    appendTable(tableId, tableHtml);

    // Append the new tab to the tab control 
    appendTabToTabControl(tableId, tableName);

    // Render and show the table
    initializeJQueryTabs();
    showHideTabContainer(true);
};

// Appends a new tab to the tab container
const appendTab = (tableId, tableName) => {
    $("#tab-container ul").append(
        `<li class=${tableId}>
            <a href="#${tableId}">${tableName}</a>
            <button class="tab-close-button" onclick="deleteTab(${tableId})">X</button>
        </li>`
    );
};

// Appends a new table to the tab container
const appendTable = (tableId, tableHtml) => {
    $("#tab-container").append(
        `<div class="table-container" id="${tableId}">
            <table>${tableHtml}</table>
        </div>`
    );
};

const appendTabToTabControl = (tableId, tableName) => {
    $("#tab-control-tab-list").append(
        `<li><p class="tab-control-list-item ${tableId}" data-tableid="${tableId}" onclick="handleTabControlListItemClick(${tableId})">${tableName}</p></li>`
    );
};

const deleteTab = (tableId) => {
    // Remove the tab
    $(`#tab-container ul .${tableId}`).remove();

    // Remove the table
    $(`#tab-container #${tableId}`).remove();

    // Remove the tab from the tab control
    $(`#tab-control-tab-list .${tableId}`).closest("li").remove();

    // Re-render the table
    initializeJQueryTabs();

    // Hide the tab container if applicable
    if ($("#tab-container ul li").length === 0)
        showHideTabContainer(false);
};

// Click handler for the tab control button
const handleTabControlClick = () => {
    showHideTabControlPopup(true);
};

// Click handler for the tab control background
const handleTabControlBackgroundClick = () => {
    showHideTabControlPopup(false);
};

// Click handler for the tab control close button
const handleTabControlCloseButtonClick = () => {
    showHideTabControlPopup(false);
};

// Click handler for tab control list items
const handleTabControlListItemClick = (tableId) => {
    // Initialization
    const listItem = $(`#tab-control-tab-list .${tableId}`);

    // Select or de-select the list item
    if (listItem.hasClass(TAB_CONTROL_LIST_ITEM_SELECTED_CLASS))
        listItem.removeClass(TAB_CONTROL_LIST_ITEM_SELECTED_CLASS)
    else
        listItem.addClass(TAB_CONTROL_LIST_ITEM_SELECTED_CLASS)
};

// Click handler for the tab control delete button
const handleTabControlDeleteButtonClick = () => {
    // Delete all selected tabs
    $(`#tab-control-tab-list .${TAB_CONTROL_LIST_ITEM_SELECTED_CLASS}`).each((_, listItem) => {
        // Determine the ID of the table to delete
        const tableId = listItem.dataset.tableid;

        // Delete the tab
        deleteTab(tableId);
    });
};

// Shows or hides the tab control and its background based on the boolean argument
const showHideTabControlPopup = (isShown) => {
    if (isShown) {
        // Cache the initial scroll position
        initialScrollPosition = window.scrollY;

        // Scroll to the top of the page
        window.scrollTo(0, 0);

        // Show the tab control popup
        $("#tab-control-background").removeClass("hidden");
        $("#tab-control-popup").removeClass("hidden");

        // Disable scroll
        enableDisableScroll(false);
    } else {
        // Scroll back to the initial position
        window.scrollTo(0, initialScrollPosition);

        // Hide the tab control popup
        $("#tab-control-background").addClass("hidden");
        $("#tab-control-popup").addClass("hidden");

        // Enable scroll
        enableDisableScroll(true);
    }
};

// Enables or disables page scroll based on the boolean argument
const enableDisableScroll = (isEnabled) => {
    if (isEnabled)
        document.body.style.overflow = "auto";
    else
        document.body.style.overflow = "hidden";
};

// Determines whether or not a given value is an integer
const isInt = (value) => {
    return (
        typeof value === "number" &&
        !isNaN(value) &&
        Number.isInteger(value)
    );
};

// Generates a range of integers in the range [min, max]
const generateRange = (min, max) => {
    const range = [];
    for (let i = min; i <= max; i++) {
        range.push(i);
    }
    return range;
};

// Shows or hides the tab container based on the boolean argument
const showHideTabContainer = (isShown) => {
    if (isShown)
        $("#tab-container").removeClass("hidden");
    else
        $("#tab-container").addClass("hidden");
};

// Run
$(document).ready(main);
