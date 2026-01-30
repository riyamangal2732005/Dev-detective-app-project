const app = document.querySelector(".github-app");
const input = document.querySelector("#searchInput");
const output = document.querySelector("#output");
const button = document.querySelector("#searchBtn");

function disableInput(state){
    input.disabled = state;
    button.disabled = state;
}
input.addEventListener("keypress", (e) => {
    if(e.key === "Enter"){
        startSearch();
        // 
        // if(username !== ""){
        //     fetchUser(username);
        // }
    }
});

function startSearch(){
    const username = input.value.trim();
    if(username === "")
    {
        alert("Kindly enter the username!");
        input.focus();
        return;
    }
    fetchUser(username);
}
button.addEventListener("click", startSearch);

function showLoader(){
    app.classList.add("loading-state");
    output.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
        </div>
    `;
}

function hideLoader(){
    app.classList.remove("loading-state");
}
async function fetchUser(username){
    showLoader();
    disableInput(true);

    try{
        const response = await fetch(`https://api.github.com/users/${username}`);
        if(!response.ok) throw new Error("Not Found");
        const data = await response.json();
        
        showProfile(data);
        fetchRepos(data.repos_url);
    }
    catch(error){
        output.innerHTML = `<div class="error">User Not Found</div>`;
    }
    finally{
        hideLoader();
        disableInput(false);
    }
}

function showProfile(user){
    const portfolio = user.blog ? user.blog.startsWith("http") ? user.blog : `https://${user.blog}` : null;
    output.innerHTML = `
        <div class="profile-card">
            <img src="${user.avatar_url}" alt="Avatar" />
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || "No bio available"}</p>
            <p>Joined : ${new Date(user.created_at).toDateString()}</p>
            ${
                portfolio
                ? `<a href="${portfolio}" target="_blank" rel="noopener noreferrer" class="portfolio-link">Portfolio</a>`
                : `<p class="no-portfolio">No Portfolio Link available</p>`
            }
        </div>
    `;
}
function renderRepos(repos){
    const repoHTML = `
    <div class="repo-section">
        <h3>Latest Repositories</h3>
        <ul class="repo-list">
            ${repos.map(repo =>`
                <li class="repo-item">
                    <a href="${repo.html_url}" target="_blank" rel="noopener">
                        ${repo.name}
                    </a>
                    <span class="repo-date">
                        Updated: ${formatDate(repo.updated_at)}
                    </span>
                </li>
            `).join("")}
        </ul>
    </div>
    `;
    output.innerHTML += repoHTML;

}
function formatDate(dateString){
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day : "2-digit",
        month : "short",
        year : "numeric"
    });
}
async function fetchRepos(reposUrl){
    try{
        const response = await fetch(reposUrl);
        if(!response.ok)
        {
            throw new Error("Repository Not Found");
        }
        const repos = await response.json();

        // sorting the repository
        const latestRepos = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);

        renderRepos(latestRepos);
    }
    catch(error){
        console.error("Repo fetch error: , error");
    }
}
