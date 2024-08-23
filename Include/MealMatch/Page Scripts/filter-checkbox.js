const statuses = ["checked", "indeterminate", "unchecked"];

class FilterCheckbox {
    constructor(id, parent) {
        this.id = id;
        this.parent = parent;
        this.setCheckbox();
    }
    setCheckbox() {
        this.status = "checked";
        const checkboxID = this.getCheckboxID(this.id);
        this.checkbox = document.getElementById(checkboxID);
        this.checkbox.addEventListener("click", () => {
            this.changeStatus();
        });
    }

    changeStatus(status=null) {
        if(status) {
            const index = statuses.indexOf(status);

            if(index < 0) { 
                console.error(`Invalid Attempted Status: ${status}`); 
            }
            else { 
                this.status = statuses[index]; 
                this.changeCheckbox();
            }
        }
        else {
            this.cycleStatus();
            this.changeCheckbox();
            this.changeParentStatus();            
        }
    }
    cycleStatus() {
        let index = statuses.indexOf(this.status);

        if(index < 0) { 
            console.error(`Invalid Set Status: ${this.status}`); 
        }
        else { 
            index++;
            if(index >= statuses.length) {
                index = 0;
            }

            this.status = statuses[index]; 
        }
    }
    changeCheckbox() {
        switch(this.status) {
            case "checked":
                this.checkbox.checked = true;
                this.checkbox.indeterminate = false;
                break;
            case "indeterminate":
                this.checkbox.checked = true;
                this.checkbox.indeterminate = true;
                break;
            case "unchecked":
                this.checkbox.checked = false;
                this.checkbox.indeterminate = false;
                break;
        }
    }
    changeParentStatus() {
        if(this.parent) {
            this.parent.childChangedStatus(this.status, true);
        }
    }  
    
    getCheckboxID(filter) {
        return `${filter.replaceAll(" ", "-")}-checkbox`;
    }
}

class FilterAccordion extends FilterCheckbox {
    setChildren(children) {
        this.children = children;
    }
    childrenToString() {
        const len = this.children.length;
        let result = "[ ";
        for(let i = 0; i < len; i++) {
            result += this.children[i].id + (i == len - 1 ? " " : ", ");
        }
        return  `${result}]`;
    }

    changeStatus(status=null, fromChild=false) {
        super.changeStatus(status);

        if(!fromChild) {
            this.changeChildrenStatus();
        }
    }
    changeChildrenStatus() {
        for(const child of this.children) {
            child.changeStatus(this.status);
        }
    }

    childChangedStatus(childStatus) {
        let takeChildStatus = true;
        for(const child of this.children) {
            if(child.status != childStatus) {
                takeChildStatus = false;
                break;
            }
        }

        if(takeChildStatus) {
            this.changeStatus(childStatus, true);
        }
        else {
            this.changeStatus("unchecked", true);
        }
        
        super.changeParentStatus();
    }
}

export { FilterCheckbox, FilterAccordion };