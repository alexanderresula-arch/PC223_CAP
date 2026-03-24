/* Security and access logic */
function protectAdminPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const role = localStorage.getItem("userRole");

    // Subtle redirect if non-admin tries to access admin.html
    if (currentPage === "admin.html" && role !== "admin") {
        window.location.replace("index.html"); 
    }
}
protectAdminPage();

/* Login, Signup, Logout */
function login() {
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;

    // Admin Credentials
    const adminTeam = ["admin", "member1", "member2", "member3"];
    const adminPassword = "ctu123"; 

    if (adminTeam.includes(user) && pass === adminPassword) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("currentUser", user);
        window.location.href = "admin.html";
        return;
    }

    // User Credentials
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let validUser = users.find(u => u.username === user && u.password === pass);

    if (validUser) {
        localStorage.setItem("userRole", "user");
        localStorage.setItem("currentUser", user);
        window.location.href = "user.html";
    } else {
        alert("Invalid username or password");
    }
}

function signup() {
    const user = document.getElementById("newUser").value;
    const pass = document.getElementById("newPass").value;

    if (!user || !pass) return alert("Please fill all fields");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.username === user)) return alert("Username already exists!");

    users.push({ username: user, password: pass });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created! You can now log in.");
    toggleAuth(); 
}

function logout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const signupSec = document.getElementById('signup-section');
    loginSec.style.display = (loginSec.style.display === "none") ? "block" : "none";
    signupSec.style.display = (signupSec.style.display === "none") ? "block" : "none";
}

/* Post and reward logic */
function getPosts() {
    return JSON.parse(localStorage.getItem("allPosts")) || [];
}

function savePosts(posts) {
    localStorage.setItem("allPosts", JSON.stringify(posts));
}

function addPost() {
    const item = document.getElementById("item").value;
    const loc = document.getElementById("location").value;
    const desc = document.getElementById("description").value;
    const reward = document.getElementById("reward").value || "No reward specified";
    const img = document.getElementById("itemImg").value || "https://via.placeholder.com/150";

    if (!item || !loc || !desc) return alert("Please fill in all details");

    let posts = getPosts();
    posts.push({
        id: Date.now(),
        item: item,
        location: loc,
        description: desc,
        reward: reward,
        image: img,
        status: "pending"
    });

    savePosts(posts);
    alert("Submitted! Wait for admin approval.");
    location.reload();
}

/* UI Rendering */
function loadDashboard() {
    const adminDiv = document.getElementById("adminPosts");
    const userDiv = document.getElementById("userFeed");
    const posts = getPosts();
    const targetDiv = adminDiv || userDiv;

    if (!targetDiv) return;
    targetDiv.innerHTML = "";

    posts.forEach((p, index) => {
        // Admins see everything and Users only see Approved items
        if (adminDiv || p.status.includes("Approved")) {
            targetDiv.innerHTML += `
                <div class="post">
                    <img src="${p.image}" class="post-img">
                    <h3>${p.item}</h3>
                    <p><b>📍 Location:</b> ${p.location}</p>
                    <p class="reward-tag"><b>🎁 Reward:</b> ${p.reward}</p>
                    <p>${p.description}</p>
                    <p><strong>Status:</strong> ${p.status}</p>
                    ${adminDiv ? `
                        <button class="approve-btn" onclick="approvePost(${index})">Approve</button>
                        <button onclick="deletePost(${index})" style="background:#e74c3c; color:white; border:none; margin-top:5px; padding:5px; border-radius:4px; cursor:pointer;">Delete</button>
                    ` : ""}
                </div>
            `;
        }
    });
}

function approvePost(index) {
    let posts = getPosts();
    posts[index].status = "Approved by Admin ✅";
    savePosts(posts);
    loadDashboard();
}

function deletePost(index) {
    let posts = getPosts();
    posts.splice(index, 1);
    savePosts(posts);
    loadDashboard();
}

window.onload = loadDashboard;

/* Search bar's functions */
function filterSearch() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const posts = document.querySelectorAll("#userFeed .post");

    posts.forEach(post => {
        // Look for the text inside the <h3> (Item Name)
        const itemName = post.querySelector("h3").innerText.toLowerCase();
        
        if (itemName.includes(query)) {
            post.style.display = "block"; // Show match
        } else {
            post.style.display = "none";  // Hide others
        }
    });
}