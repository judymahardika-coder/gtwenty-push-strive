const AUTH_KEY = "gps_auth_v01";

async function getCoachProfile(userId) {
  const { data, error } = await window.gpsSupabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function authLoading(isLoading) {
  const btn = document.getElementById("loginButton");
  if (!btn) return;

  btn.disabled = isLoading;
  btn.textContent = isLoading
    ? "Memproses..."
    : "Masuk sebagai Coach";
}

function showAuthError(message) {
  const el = document.getElementById("authError");
  if (el) el.textContent = message;
}

async function login() {
  const {
    data: { session }
  } = await window.gpsSupabase.auth.getSession();

  if (session?.user) {
    try {
      const profile = await getCoachProfile(session.user.id);

      if (profile?.role === "coach") {
        state.role = "coach";
        state.page = "home";
        state.authUserId = session.user.id;
        state.profileName = profile.full_name || "Coach";

        render();
        return;
      }
    } catch (error) {
      console.error("Profile check failed:", error);
    }
  }

  document.getElementById("app").innerHTML = `
    <div class="login">
      <div class="login-box">

        <img src="logo.png" alt="GTWENTY">

        <h1>GPS</h1>
        <div class="muted">GTWENTY PUSH STRIVE</div>

        <p>Train • Ride • Progress</p>

        <div class="field" style="text-align:left;margin-top:18px">
          <label>Email Coach</label>
          <input
            id="loginEmail"
            type="email"
            autocomplete="email"
            value="judy.mahardika@gmail.com"
            placeholder="Email"
          >
        </div>

        <div class="field" style="text-align:left;margin-top:12px">
          <label>Password</label>
          <input
            id="loginPassword"
            type="password"
            autocomplete="current-password"
            placeholder="Password"
          >
        </div>

        <div
          id="authError"
          style="
            min-height:20px;
            color:#ff6b6b;
            font-size:13px;
            margin:10px 0;
            text-align:left
          "
        ></div>

        <button
          id="loginButton"
          class="btn"
          style="width:100%"
          onclick="enterApp()"
        >
          Masuk sebagai Coach
        </button>

        <p style="margin-top:15px;font-size:11px">
          Login aman menggunakan Supabase Authentication.
        </p>

      </div>
    </div>
  `;
}

async function enterApp() {
  const email =
    document.getElementById("loginEmail")?.value.trim();

  const password =
    document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    showAuthError("Email dan password wajib diisi.");
    return;
  }

  authLoading(true);
  showAuthError("");

  try {
    const { data, error } =
      await window.gpsSupabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) throw error;

    const profile =
      await getCoachProfile(data.user.id);

    if (!profile) {
      await window.gpsSupabase.auth.signOut();

      throw new Error(
        "Profil Coach belum ditemukan di database."
      );
    }

    if (profile.role !== "coach") {
      await window.gpsSupabase.auth.signOut();

      throw new Error(
        "Akun ini belum memiliki role Coach."
      );
    }

    state.role = "coach";
    state.page = "home";
    state.authUserId = data.user.id;
    state.profileName =
      profile.full_name || "Coach";

    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        userId: data.user.id,
        role: profile.role,
        fullName: profile.full_name || "Coach"
      })
    );

    render();

  } catch (error) {
    console.error("Login failed:", error);

    showAuthError(
      error.message ||
      "Login gagal. Periksa email dan password."
    );

    authLoading(false);
  }
}

async function logout() {
  await window.gpsSupabase.auth.signOut();

  localStorage.removeItem(AUTH_KEY);

  state.role = null;
  state.page = "home";

  delete state.authUserId;
  delete state.profileName;

  login();
}

function chooseRole(role) {
  if (role === "parent") {
    showAuthError(
      "Login Parent akan kita aktifkan setelah modul Coach selesai."
    );

    return;
  }

  login();
}

window.addEventListener(
  "DOMContentLoaded",
  () => login()
);
