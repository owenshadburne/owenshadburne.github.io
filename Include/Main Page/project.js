//procedurally generate a new css rule for each
const changeOnFlip = {
	"project-card": "borderColor",
	"project-card-content": "color",
	"project-card-title": "borderColor"
};

class Project {
	/*
		id: string (name with dashes)
		name: string
		date: string (month/day)
		language: string
		technologies: string[]
		links: { string: string }
		about: string
		images: string[] (absolute paths)
		color: string
	*/

	constructor(name, options) {
		const { date, language, technologies, links, about, images, color } =
			options;

		this.id = name.replace(" ", "-");
		this.name = name;
		this.date = date;
		this.language = language;
		this.technologies = technologies;
		this.links = links;
		this.about = about;
		this.images = images;
		this.color = color;
	}

	createHTML(template) {
		const clone = template.content.cloneNode(true);

		const card = this.selrep(clone, "card");

		const title = this.selrep(clone, "title");
		title.addEventListener("click", () => {
			this.onClick();
		});

		const titleText = this.selrep(clone, "card-title-text");
		titleText.textContent = this.name;

		this.setImage(clone);

		const about = this.selrep(clone, "about");
		about.textContent = this.about;

		this.setTags(clone);
		this.setLinks(clone);

		return clone;
	}

	onClick() {
		if (!this.card) {
			this.card = document.getElementById(this.getIDReplacement("card"));
		}

		if (this.card.classList.contains("flipped")) {
			this.card.classList.remove("flipped");
			this.setChangeOnFlip(false);
		} else {
			this.card.classList.add("flipped");
			this.setChangeOnFlip(true);
		}
	}
	setChangeOnFlip(flipped) {
		for (const [cls, attr] of Object.entries(changeOnFlip)) {
			if (this.card.classList.contains(cls)) {
				this.card.style[attr] = flipped ? this.color : null;
			} else {
				const elem = this.card.querySelector(`.${cls}`);
				elem.style[attr] = flipped ? this.color : null;
			}
		}
	}

	setImage(clone) {
		const image = this.selrep(clone, "photo");

		if (this.images.length > 0) {
			image.src = this.images[0];
		} else {
			image.src = this.getPlaceholderImage();
		}

		image.alt = `${this.name} Image`;
	}
	getPlaceholderImage() {
		const rand = this.getRandomInt(350, 400);
		return `http://placekitten.com/${rand}/${rand}`;
	}

	setTags(clone) {
		const tags = this.selrep(clone, "tags");

		tags.innerHTML += this.createTag(this.language);

		for (const technology of this.technologies) {
			tags.innerHTML += this.createTag(technology);
		}
	}
	createTag(tag) {
		return `
        <div class="tag rounded-pill">
            ${tag}
        </div>`;
	}

	setLinks(clone) {
		const links = this.selrep(clone, "links");

		for (const [name, url] of Object.entries(this.links)) {
			links.innerHTML += this.createLink(name, url);
		}
	}
	createLink(name, url) {
		return `
        <a type="button" class="btn btn-outline-light link"
            href="${url}">
            ${name}
        </a>`;
	}

	// select and replace
	selrep(clone, id) {
		const item = clone.querySelector(`#${id}`);
		item.id = this.getIDReplacement(id);
		return item;
	}
	getIDReplacement(id) {
		return `${this.id}-${id}`;
	}

	toString() {
		return this.name;
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}

export { Project };
