/* ----- Web Page Functionallity ---- */

function openModal() {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("editBtn").style.display = "none";
    document.getElementById("db-live").style.display = "none";
    Array.from(document.getElementsByClassName("chapter-number")).forEach(e => e.style.display = "none");
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("editBtn").style.display = "inline";
    document.getElementById("db-live").style.display = "flex";
    Array.from(document.getElementsByClassName("chapter-number")).forEach(e => e.style.display = "block");;
}

//edit source button open input modal
document.getElementById("editBtn").addEventListener("click", () => openModal());

//close button closes input modal
document.getElementsByClassName("close")[0].addEventListener("click", () => closeModal())

//on form submit(keyboard enter) clicks confirm button
document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementsByClassName("confirm")[0].click()
});

//import button get last chapter from the database
document.getElementsByClassName("import")[0].addEventListener("click", () => {
    fetch("http://127.0.0.1:3000/db").then((res) => res.json().then((res) => document.getElementById("domain").value = res.url)).catch((err) => document.getElementById("domain").value = "Erro ao conectar com o servidor")
})

//confirm button fetches chapter and close modal
document.getElementsByClassName("confirm")[0].addEventListener("click", () => {
    userURL = document.getElementById("domain").value
    newURL = userURL
    source = "http://127.0.0.1:3000/s?url=" + userURL

    closeModal()

    fetchPages(source).then((res) => renderPages(res))

})

/* ----- Chapter Rendering Functionallity ---- */

let userURL;
let newURL;
let source;
let title = "No title"
let chapter = 0
const MAX_PAGES_IN_DOM = 100

let isLoading = false;

//feedContainer is where new chapter will be created
const feedContainer = document.getElementById("chapter-content");

//loadingTrigger is bound to what element triggers the fetching of new chapters to the infinite scroll
let loadingTrigger = document.getElementById("first-trigger");


//fetch the pages from server
async function fetchPages(url) {
    try {
        //stores the json response from the server
        const response = await fetch(url)
        const res = await response.json()
        const data = res.data
        let chapterStr;

        //store title and chapter number from the json data
        title = data[0].title
        chapterStr = data[0].chapter
        chapter = Number.parseInt(chapterStr.replace(/[^0-9]/g, ''), 10)

        //update screen elements with json data
        const titleElement = document.getElementsByClassName("main-title")
        const subElement = document.getElementsByClassName("sub-title")
        titleElement[0].innerText = title
        document.getElementById("sourceText").innerText = "From " + userURL;

        //stores chapter pages (images) from json data
        let pages = [];
        for (let i = 2; i < data.length; i++) {
            pages.push(data[i].src)
        }

        //return pages
        return pages;
    } catch (error) {
        console.error("Error fetching pages:", error);
        return [];
    }
}


//redering pages in the screen
function renderPages(pages) {

    //untrack the last trigger 
    observer.unobserve(loadingTrigger)

    //store last loaded chapter
    const lastRenderedPage = document.getElementById("chapter-content").lastElementChild

    //creates chapter number to update when a new chapter is rendered
    const chapterLabel = document.getElementsByClassName("chapter-label")[0]
    const chapterText = document.createElement('div')
    const chapterNumber = document.createElement('div')
    chapterText.classList.add('chapter-text')
    chapterNumber.classList.add('chapter-number')
    chapterNumber.innerHTML = "CHAPTER " + chapter
    chapterText.appendChild(chapterNumber)
    chapterLabel.appendChild(chapterText)

    //separates chapter divs into their respective chapters
    const chapterSection = document.createElement('div')
    chapterSection.dataset.chapter = chapter

    //creates a div and img element for each page and add them to the feedContainer
    pages.forEach(srcPage => {
        const chapterPage = document.createElement('div');
        const image = document.createElement('img')
        chapterPage.classList.add('page');
        image.src = srcPage;
        image.width = 900;
        image.style.height = "100%"
        chapterPage.appendChild(image)
        chapterSection.appendChild(chapterPage)
        feedContainer.appendChild(chapterSection);

        while (feedContainer.children.length > MAX_PAGES_IN_DOM) {
            feedContainer.removeChild(feedContainer.firstChild);
        }
    });

    //if there is a last page and it isnt in the first loaded chapter scroll to last page with offset to be in the end of the viewing screen to prevent spamming
    if (lastRenderedPage && window.scrollY > 100) {
        scrollTo({ top: lastRenderedPage.lastChild.offsetTop - window.innerHeight + 7, left: 0, behavior: "instant" })
    }

    //if there is an last page than that one will be the new loading trigger + adding full chapter height to chapter label, else default first trigger
    if (document.getElementById("chapter-content").lastElementChild) {
        loadingTrigger = document.getElementById("chapter-content").lastElementChild.lastChild
        document.getElementById("chapter-content").lastElementChild.lastChild.lastChild.onload = () => chapterText.style.height = (document.getElementById("chapter-content").lastElementChild.offsetHeight) + "px"
    } else {
        loadingTrigger = document.getElementById('first-trigger');
    }
    console.log(loadingTrigger)
    observer.observe(loadingTrigger)

}

//observer that triggers within certain condition
const observerCallback = async (entries) => {
    const target = entries[0];

    //condition is intersecting(seeing) loading trigger and not beein loading someting already
    if (target.isIntersecting && !isLoading) {
        isLoading = true;

        //changes the chanter number and url to a new url for the next chapter, this is domain specific
        newURL = newURL.split("/")
        newURL.pop()
        newURL[newURL.length - 1]++
        chapter = newURL[newURL.length - 1]
        newURL = newURL.join("/")
        newURL = newURL + "/1"
        let newSource = "http://127.0.0.1:3000/s?url=" + newURL

        //update database with new chapter and url
        await fetch("http://127.0.0.1:3000/u", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chapter, url: newURL })
        })

        fetch("http://127.0.0.1:3000/db").then((res) => res.json().then((res) => document.getElementById("live-text").innerHTML = res.chapter)).catch((err) => document.getElementById("domain").value = -1)


        // Fetch the next chapter and render it, or ends the infinite scrolling
        fetchPages(newSource).then((res) => {
            if (res.length > 0) {
                renderPages(res);
            } else {
                observer.unobserve(loadingTrigger);
                loadingTrigger.innerText = "Você chegou no último capítulo";
                console.log("No more pages loading")
            }

            isLoading = false;
        });
    }
};

const observerOptions = {
    root: null, // uses the viewport
    rootMargin: '0px',
    threshold: 0.1 // triggers when 10% of the trigger is visible
}

const observer = new IntersectionObserver(observerCallback, observerOptions);

