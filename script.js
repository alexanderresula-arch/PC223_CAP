// FIREBASE CONFIG & INITIALIZATION
// This object contains all the credentials that identify and connect
// this project to its specific Firebase account and database in the cloud.
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

// This block initializes (starts up) Firebase using the config above.
// The "if" check prevents it from being initialized more than once,
// which would cause an error. Then we get a reference to the database
// so we can read and write data throughout the script.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

/* security access */
// This function protects the admin page from being accessed by regular users.
// It checks the current page's filename and the user's role stored in localStorage.
// If someone who is not an admin tries to open admin.html, they get redirected to index.html.
function protectAdminPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const role = localStorage.getItem("userRole");
    if (currentPage === "admin.html" && role !== "admin") {
        window.location.replace("index.html"); 
    }
}
// We call it immediately so the check runs as soon as the page loads.
protectAdminPage();



/* cloud post logic */
// This function runs when the user clicks "Post for Approval" on the user dashboard.
// It collects all the form values (item name, location, description, reward, and photo),
// converts the photo into a base64 text string using FileReader so it can be stored
// in the database, then pushes the entire post object to Firebase with a status of "pending".
// It also saves the current logged-in username so it shows on the post card.
// Once saved successfully, it clears the form and shows a green success message to the user.
function addPost() {
    const item = document.getElementById("item").value;
    const loc = document.getElementById("location").value;
    const desc = document.getElementById("description").value;
    const reward = document.getElementById("reward").value || "No reward specified";
    const fileInput = document.getElementById("itemImg");
    const file = fileInput.files[0];

    // Get the currently logged-in username from localStorage to attach to the post
    const currentUser = localStorage.getItem("currentUser") || "Anonymous";

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
            postedBy: currentUser, // saves who posted this item
            status: "pending",
            timestamp: Date.now()
        };

        // this sends it to the Cloud
        database.ref('allPosts').push(postData)
            .then(() => {
                // Clear the form fields so the user knows it was submitted
                document.getElementById("item").value = "";
                document.getElementById("location").value = "";
                document.getElementById("description").value = "";
                document.getElementById("reward").value = "";
                document.getElementById("itemImg").value = "";

                // Show a visible on-page success message instead of alert + reload
                const msg = document.getElementById("postStatusMsg");
                msg.textContent = "✅ Your item has been submitted and is pending admin approval!";
                msg.style.display = "block";

                // Hide the message after 5 seconds
                setTimeout(() => { msg.style.display = "none"; }, 5000);
            })
            .catch(err => alert("Error: " + err.message));
    };

    reader.readAsDataURL(file); // Start the conversion
}

/* UI Rendering */
// This function is responsible for loading and displaying all posts on the page.
// It detects which page it's on by checking if "adminPosts" or "userFeed" exists in the DOM.
// It then sets up a real-time listener on Firebase — meaning whenever data changes in the
// database, the page automatically updates without needing a refresh.
// Admins see ALL posts regardless of status, while regular users only see posts
// that have been approved by the admin.
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
                            <p><b>👤 Posted by:</b> ${p.postedBy || "Anonymous"}</p>
                            <p><strong>Status:</strong> ${p.status}</p>
                            <p><strong>📅 Reported:</strong> ${new Date(p.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

// This function is called when the admin clicks the "Approve" button on a post.
// It finds the post in Firebase using its unique key and updates its status
// to "Approved by Admin ✅", which makes it visible on the user feed.
function approvePost(key) {
    database.ref('allPosts/' + key).update({
        status: "Approved by Admin ✅"
    });
}

// This function is called when the admin clicks the "Delete" button on a post.
// It asks for confirmation first, then permanently removes the post from
// Firebase using its unique key.
function deletePost(key) {
    if(confirm("Delete this post?")) {
        database.ref('allPosts/' + key).remove();
    }
}

// This tells the browser to run loadDashboard() as soon as the page finishes loading.
// Without this, the posts would never appear because the function would never be called.
window.onload = loadDashboard;

/* Login, Signup, Logout */
// This function runs when the user clicks "Log In" on the login page.
// It first checks if the entered credentials match the hardcoded admin accounts.
// If not, it looks up the username in the Firebase "users" node and checks
// if the password matches. If everything checks out, the user is redirected
// to user.html. If nothing matches, an error alert is shown.
function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    if (!user || !pass) return alert("Please fill all fields");

    // Admin Credentials
    const adminTeam = ["admin", "member1", "member2", "member3"];
    const adminPassword = "ctu123"; 

    if (adminTeam.includes(user) && pass === adminPassword) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("currentUser", user);
        window.location.href = "admin.html";
        return;
    }

    // Look up the username in the Firebase "users" node
    database.ref('users/' + user).once('value', (snapshot) => {
        const userData = snapshot.val();

        // Check if the user exists and the password matches
        if (userData && userData.password === pass) {
            localStorage.setItem("userRole", "user");
            localStorage.setItem("currentUser", user);
            window.location.href = "user.html";
        } else {
            alert("Invalid username or password");
        }
    });
}

// This function runs when someone clicks "Sign Up".
// It validates that both fields are filled, then checks Firebase to make sure
// the username isn't already taken. If it's available, it saves the new user
// (username + password) into the "users" node in Firebase.
// After saving, it switches the view back to the login form.
function signup() {
    const user = document.getElementById("newUser").value.trim();
    const pass = document.getElementById("newPass").value.trim();

    if (!user || !pass) return alert("Please fill all fields");

    // Check Firebase if the username already exists
    database.ref('users/' + user).once('value', (snapshot) => {
        if (snapshot.exists()) {
            alert("Username already exists! Please choose another.");
            return;
        }

        // Save the new user to Firebase under the "users" node
        database.ref('users/' + user).set({
            username: user,
            password: pass
        }).then(() => {
            alert("Account created! You can now log in.");
            toggleAuth();
        }).catch(err => alert("Error: " + err.message));
    });
}

// This function logs the user out by removing their role and username
// from localStorage, then redirecting them back to the login page (index.html).
function logout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// This function toggles between the Login and Sign Up forms on index.html.
// It works by showing whichever form is currently hidden and hiding the other one.
function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const signupSec = document.getElementById('signup-section');
    loginSec.style.display = (loginSec.style.display === "none") ? "block" : "none";
    signupSec.style.display = (signupSec.style.display === "none") ? "block" : "none";
}

/* Search bar's functions */
// This function runs every time the user types in the search bar on the user dashboard.
// It loops through every visible post card and checks if the item name contains
// the search query. Matching posts are shown, non-matching ones are hidden.
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