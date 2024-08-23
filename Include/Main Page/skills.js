class Skill {
    constructor(name, image) {
        this.name = name;
        this.image = image;
    }

    createHTML(template) {
        const clone = template.content.cloneNode(true);
        
        const title = this.selrep(clone, "name");
        title.textContent = this.name;

        const img = clone.querySelector("img");
        img.src = this.image;
        img.alt = this.name;
        img.title = this.name;

        return clone;
    }
    
    selrep(clone, id) {
      const item = clone.querySelector(`#${id}`);
      item.id = `${this.name}-${id}`;
      return item;
    }
}

class Category {
    constructor(name) {
        this.name = name;
        this.skills = [];
    }

    createHTML(categoryTemplate, skillTempalte) {
        const clone = categoryTemplate.content.cloneNode(true);

        const title = this.selrep(clone, "title");
        title.textContent = this.name;

        const body = this.selrep(clone, "body");
        for (const skill of this.skills) {
            const html = skill.createHTML(skillTempalte);
            body.append(html);
        }

        return clone;
    }

    addSkill(skill) {
        this.skills.push(skill);
    }

    selrep(clone, id) {
        const item = clone.querySelector(`#${id}`);
        item.id = `${this.name}-${id}`;
        return item;
    }
}

export { Category, Skill };