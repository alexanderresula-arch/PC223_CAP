// FIREBASE CONFIG & INITIALIZATION
const firebaseConfig = {
    apiKey: "AIzaSyBjYoaNHIQbAiXuXFGYh9iiB-2cvCSe7zo",
    authDomain: "lostandfound-pc223-2ndyear.firebaseapp.com",
    databaseURL: "https://lostandfound-pc223-2ndyear-default-rtdb.firebaseio.com", 
    projectId: "lostandfound-pc223-2ndyear",
    storageBucket: "lostandfound-pc223-2ndyear.firebasestorage.app",
    messagingSenderId: "256167183851",
    appId: "1:256167183851:web:a7f5fc38d853cb25cf45ae",
    measurementId: "G-YZXQ07R7KF"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

/* security access */
function protectAdminPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const role = localStorage.getItem("userRole");
    if (currentPage === "admin.html" && role !== "admin") {
        window.location.replace("index.html"); 
    }
}
protectAdminPage();



/* cloud post logic */
function addPost() {
    const item = document.getElementById("item").value;
    const loc = document.getElementById("location").value;
    const desc = document.getElementById("description").value;
    const reward = document.getElementById("reward").value || "No reward specified";
    const fileInput = document.getElementById("itemImg");
    const file = fileInput.files[0];

    if (!item || !loc || !desc || !file) return alert("Please fill all details and pick a photo!");

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;

        const postData = {
            item: item,
            location: loc,
            description: desc,
            reward: reward,
            image: base64Image,
            status: "pending",
            timestamp: Date.now()
        };

        // this sends it to the Cloud
        database.ref('allPosts').push(postData)
            .then(() => {
                alert("Success! Your post is pending admin approval ✅");
                location.reload();
            })
            .catch(err => alert("Error: " + err.message));
    };
    reader.readAsDataURL(file);
}

/* UI Rendering */
function loadDashboard() {
    const adminDiv = document.getElementById("adminPosts");
    const userDiv = document.getElementById("userFeed");
    const targetDiv = adminDiv || userDiv;

    if (!targetDiv) return;

    // Listen to Cloud changes in real-time
    database.ref('allPosts').on('value', (snapshot) => {
        targetDiv.innerHTML = "";
        const data = snapshot.val();

        if (data) {
            Object.keys(data).forEach((key) => {
                const p = data[key];
                // Admin sees all, User sees only Approved
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
                                <button class="approve-btn" onclick="approvePost('${key}')">Approve</button>
                                <button onclick="deletePost('${key}')" style="background:#e74c3c; color:white; border:none; margin-top:5px; padding:5px; border-radius:4px; cursor:pointer;">Delete</button>
                            ` : ""}
                        </div>
                    `;
                }
            });
        }
    });
}

function approvePost(key) {
    database.ref('allPosts/' + key).update({
        status: "Approved by Admin ✅"
    });
}

function deletePost(key) {
    if(confirm("Delete this post?")) {
        database.ref('allPosts/' + key).remove();
    }
}

window.onload = loadDashboard;

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
    const fileInput = document.getElementById("itemImg");
    const file = fileInput.files[0];

    if (!item || !loc || !desc || !file) return alert("Please fill all details and pick a photo!");

    // a "reader" to turn the image into text
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Image = e.target.result; // makes image a text

        const postData = {
            item: item,
            location: loc,
            description: desc,
            reward: reward,
            image: base64Image, // save the text string 
            status: "pending",
            timestamp: Date.now()
        };

        // saves it to database
        database.ref('allPosts').push(postData)
            .then(() => {
                alert("Success! Your post (with image) is live.");
                location.reload();
            });
    };

    reader.readAsDataURL(file); // Start the conversion
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