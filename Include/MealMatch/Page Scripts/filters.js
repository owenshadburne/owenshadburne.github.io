import { filters } from "/Include/MealMatch/Google APIs/google-api.js";
import { FilterCheckbox, FilterAccordion } from "/Include/MealMatch/Page Scripts/filter-checkbox.js";
const filterTitle = "Filters", checkboxSuffix = "-checkbox";
let filterDiv;

function populateFilters() {
    filterDiv = document.getElementById("filters");
    createFilters();
    createCheckboxes();
}

function createFilters() {
    let titledFilter = {};
    titledFilter[filterTitle] = filters;

    const html = createFiltersRecursive(titledFilter)[0];
    filterDiv.innerHTML = html;
}
function createFiltersRecursive(obj, depth=0) {
    let result = "", type = "accordion";

    for(const o in obj) {
        if(isFinalDepth(obj[o])) {
            result += createCheckbox(o, obj[o]);
            type = "checkbox";
        }
        else {
            const [ dive, typeDeep ] = createFiltersRecursive(obj[o], depth + 1);
            result += createAccordion(o, typeDeep == "checkbox");
            result += dive;
        }
    }

    result += getAccordionFooter(type == "checkbox");
    return [ result, type ];
}

function createAccordion(filter, includeCheckboxes=false) {
    const mainFilter = filter == filterTitle;
    const checkboxes = includeCheckboxes ? `<div class="checkboxes">` : "";
    const filterID = getFilterID(filter);

    return `
    <!-- ${filter} -->
    <div class="accordion accordion--custom">
        <div class="accordion-item" id="${filterID}-item">
            <h2 class="accordion-header">
                <input type="checkbox" class="form-check-input no-margin" checked id="${filterID}${checkboxSuffix}"></input>
                <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#${filterID}-collapse"
                    aria-expanded="true" aria-controls="${filterID}-collapse">
                    <p class="${mainFilter ? "l-font" : "m-font"}">${filter}</p>
                </button>
                ${mainFilter ? `
                <button type="button" class="image-button"
                    data-bs-toggle="modal" data-bs-target="#filtersModal" style="padding-right: 1rem">
                    <img class="pill-image" src="/Images/MealMatch/Info.svg">
                </button>` : ""}
            </h2>
            <div id="${filterID}-collapse"
                class="accordion-collapse collapse" data-bs-parent="#${filterID}-item">
                <div class="accordion-body" id="${filterID}-dropdown">
                    ${checkboxes}`;
}
function getAccordionFooter(hasCheckbox=false) {
    return `${hasCheckbox ? "</div>" : ""}
                </div>
            </div>
        </div>
    </div>`;
}
function createCheckbox(filter, id) {
    const filterID = getFilterID(filter);

    return `
    <div class="form-check">
        <input class="form-check-input" type="checkbox" checked id="${filterID}${checkboxSuffix}" filter="${id}"></input>
        <label class="form-check-label" for="${filterID}${checkboxSuffix}"> 
            ${filter}
        </label>
    </div>`;
}

function createCheckboxes() {
    const filterAccordion = new FilterAccordion("Filters", null);
    const children = createCheckboxesRecursive(filters, filterAccordion);
    filterAccordion.setChildren(children);
}
function createCheckboxesRecursive(obj, parent, depth=0) {
    let children = [];

    for(const o in obj) {
        const filterID = getFilterID(o);

        if(isFinalDepth(obj[o])) {
            const filterCheckbox = new FilterCheckbox(filterID, parent);
            children.push(filterCheckbox);
        }
        else {
            const filterAccordion = new FilterAccordion(filterID, parent);
            const newChildren = createCheckboxesRecursive(obj[o], filterAccordion, depth + 1);
            filterAccordion.setChildren(newChildren);

            children.push(filterAccordion);
            children.concat(newChildren);
        }
    }

    return children;
}

function isFinalDepth(values) {
    return typeof(values) == "string";
}

function getAllFilterIDs(obj=filters, depth=0) {
    let result = [];
    for(const o in obj) {
        if(isFinalDepth(obj[o])) {
            result.push(`${getFilterID(o)}${checkboxSuffix}`);
        }
        else {
            const dive = getAllFilterIDs(obj[o], depth + 1);
            result = result.concat(dive);
        }
    }

    return result;
}
function getFilterID(filter) {
    return filter.replaceAll(" ", "-");
}

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.getElementsByClassName("indeterminate");
    for(const element of elements) {
        element.indeterminate = true;
    }
})

export { populateFilters, getAllFilterIDs };