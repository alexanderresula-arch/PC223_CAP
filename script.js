// security
function protectAdminPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const role = localStorage.getItem("userRole");

    // redirects user that doesn't have an admin badge
    if (currentPage === "admin.html" && role !== "admin") {
        window.location.replace("index.html"); 
    }
}
protectAdminPage(); // immediately call back


// login logic
function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    //admin logic
    const adminTeam = ["admin", "member1", "member2", "member3"];
    const adminPassword = "ctu123"; 

    if (adminTeam.includes(user) && pass === adminPassword) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("currentUser", user);
        window.location.href = "admin.html";
        return;
    }

    // user logic
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


// logout function
function logout() {
    // clear everything when another user enters so they can start fresh
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

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

//logic for separating admin and users
function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    // ADMIN CHECK 
    if (user === "admin" && pass === "ctu123") { // Choose a secure admin password
        localStorage.setItem("userRole", "admin");
        window.location.href = "admin.html";
        return; 
    }

    // REGULAR USER CHECK
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