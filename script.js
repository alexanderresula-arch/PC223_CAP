// DATABASE 
function getPosts() {
    return JSON.parse(localStorage.getItem("allPosts")) || [];
}

function savePosts(posts) {
    localStorage.setItem("allPosts", JSON.stringify(posts));
}

// AUTHENTICATION
function signup() {
    let user = document.getElementById("newUser").value;
    let pass = document.getElementById("newPass").value;

    if (!user || !pass) return alert("Please fill all fields");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.username === user)) return alert("Username already exists!");

    users.push({ username: user, password: pass });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created! You can now log in.");
    toggleAuth(); // Switch back to login view
}

function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.username === user && u.password === pass)) {
        window.location.href = "user.html";
    } else {
        alert("Invalid username or password");
    }
}

function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const signupSec = document.getElementById('signup-section');
    if (loginSec.style.display === "none") {
        loginSec.style.display = "block";
        signupSec.style.display = "none";
    } else {
        loginSec.style.display = "none";
        signupSec.style.display = "block";
    }
}

// POSTING LOGIC 
function addPost() {
    let item = document.getElementById("item").value;
    let loc = document.getElementById("location").value;
    let desc = document.getElementById("description").value;
    let img = document.getElementById("itemImg").value || "https://via.placeholder.com/150";

    if (!item || !loc || !desc) return alert("Please fill in all details");

    let posts = getPosts();
    posts.push({
        id: Date.now(),
        item: item,
        location: loc,
        description: desc,
        image: img,
        status: "pending"
    });

    savePosts(posts);
    alert("Submitted! Wait for admin approval.");
    location.reload(); // Refresh to show in "Recent Reports Status"
}

// ADMIN & FEED LOADING 
function loadDashboard() {
    const adminDiv = document.getElementById("adminPosts");
    const userDiv = document.getElementById("userFeed");
    const posts = getPosts();

    const targetDiv = adminDiv || userDiv;
    if (!targetDiv) return;

    targetDiv.innerHTML = "";

    posts.forEach((p, index) => {
        // If we are on the User page, we show everything. 
        // If we are on a public feed (optional), we'd filter for "approved".
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
        `;
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

// Automatically load content when page opens
window.onload = loadDashboard;

function addPost() {
    let item = document.getElementById("item").value;
    let loc = document.getElementById("location").value;
    let desc = document.getElementById("description").value;
    let reward = document.getElementById("reward").value || "No reward specified"; // Capture reward
    let img = document.getElementById("itemImg").value || "https://via.placeholder.com/150";

    if (!item || !loc || !desc) return alert("Please fill in all details");

    let posts = getPosts();
    posts.push({
        id: Date.now(),
        item: item,
        location: loc,
        description: desc,
        reward: reward, // Save reward to the object
        image: img,
        status: "pending"
    });

    savePosts(posts);
    alert("Submitted! Wait for admin approval.");
    location.reload();
}