const AUTH_KEY = "gps_auth_v01";
const GPS_SITE_URL = "https://judymahardika-coder.github.io/gtwenty-push-strive/";

let recoveryMode = false;

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

function showPasswordRecovery() {
  recoveryMode = true;

  document.getElementById("app").innerHTML = `
    <div class="login">
      <div class="login-box">

        <img src="logo.png" alt="GTWENTY">

        <h1>GPS</h1>
        <div class="muted">GTWENTY PUSH STRIVE</div>

        <p>Atur Password Baru</p>

        <div class="field" style="text-align:left;margin-top:18px">
          <label>Password Baru</label>
          <input
            id="newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Password baru"
          >
        </div>

        <div class="field" style="text-align:left;margin-top:12px">
          <label>Konfirmasi Password</label>
          <input
            id="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Ulangi password baru"
          >
        </div>

        <div
          id="recoveryError"
          style="
            min-height:20px;
            color:#ff6b6b;
            font-size:13px;
            margin:10px 0;
            text-align:left
          "
        ></div>

        <button
          id="recoveryButton"
          class="btn"
          style="width:100%"
          onclick="updatePassword()"
        >
          Simpan Password Baru
        </button>

        <p style="margin-top:15px;font-size:11px">
          Gunakan password minimal 6 karakter dan jangan bagikan kepada siapa pun.
        </p>

      </div>
    </div>
  `;
}

function recoveryLoading(isLoading) {
  const btn = document.getElementById("recoveryButton");
  if (!btn) return;

  btn.disabled = isLoading;
  btn.textContent = isLoading
    ? "Menyimpan..."
    : "Simpan Password Baru";
}

function showRecoveryError(message) {
  const el = document.getElementById("recoveryError");
  if (el) el.textContent = message;
}

async function updatePassword() {
  const password =
    document.getElementById("newPassword")?.value || "";

  const confirmPassword =
    document.getElementById("confirmPassword")?.value || "";

  if (!password || !confirmPassword) {
    showRecoveryError(
      "Password baru dan konfirmasi wajib diisi."
    );
    return;
  }

  if (password.length < 6) {
    showRecoveryError(
      "Password minimal 6 karakter."
    );
    return;
  }

  if (password !== confirmPassword) {
    showRecoveryError(
      "Konfirmasi password tidak sama."
    );
    return;
  }

  recoveryLoading(true);
  showRecoveryError("");

  try {
    const { error } =
      await window.gpsSupabase.auth.updateUser({
        password
      });

    if (error) throw error;

    await window.gpsSupabase.auth.signOut();

    localStorage.removeItem(AUTH_KEY);

    recoveryMode = false;

    document.getElementById("app").innerHTML = `
      <div class="login">
        <div class="login-box">

          <img src="logo.png" alt="GTWENTY">

          <h1>Password Berhasil Diubah</h1>

          <div class="muted">
            GPS — GTWENTY PUSH STRIVE
          </div>

          <p style="margin-top:15px">
            Password Coach sudah berhasil diperbarui.
          </p>

          <button
            class="btn"
            style="width:100%;margin-top:15px"
            onclick="login()"
          >
            Kembali ke Login
          </button>

        </div>
      </div>
    `;

  } catch (error) {

    console.error(
      "Password update failed:",
      error
    );

    showRecoveryError(
      error.message ||
      "Password gagal diubah. Silakan coba lagi."
    );

    recoveryLoading(false);
  }
}

async function requestPasswordReset() {

  const email =
    document
      .getElementById("loginEmail")
      ?.value
      .trim();

  if (!email) {
    showAuthError(
      "Masukkan email Coach terlebih dahulu."
    );
    return;
  }

  authLoading(true);
  showAuthError("");

  try {

    const { error } =
      await window.gpsSupabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: GPS_SITE_URL
        }
      );

    if (error) throw error;

    showAuthError(
      "Link reset password sudah dikirim ke email Coach."
    );

  } catch (error) {

    console.error(
      "Reset password request failed:",
      error
    );

    showAuthError(
      error.message ||
      "Gagal mengirim link reset password."
    );

  } finally {

    authLoading(false);
  }
}

async function login() {

  if (recoveryMode) return;

  // TAMPILKAN FORM LOGIN TERLEBIH DAHULU
  document.getElementById("app").innerHTML = `
    <div class="login">
      <div class="login-box">

        <img src="logo.png" alt="GTWENTY">

        <h1>GPS</h1>

        <div class="muted">
          GTWENTY PUSH STRIVE
        </div>

        <p>
          Train • Ride • Progress
        </p>

        <div
          class="field"
          style="text-align:left;margin-top:18px"
        >
          <label>Email Coach</label>

          <input
            id="loginEmail"
            type="email"
            autocomplete="email"
            value="judy.mahardika@gmail.com"
            placeholder="Email Coach"
          >
        </div>

        <div
          class="field"
          style="text-align:left;margin-top:12px"
        >
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

        <button
  id="resetButton"
  type="button"
  class="btn"
  style="
    width:100%;
    margin-top:10px;
    background:transparent;
    border:1px solid rgba(255,255,255,.15)
  "
>
  
          Lupa Password?
        </button>

        <p
          style="
            margin-top:15px;
            font-size:11px
          "
        >
          Login aman menggunakan Supabase Authentication.
        </p>

      </div>
    </div>
     `;
  const resetButton = document.getElementById("resetButton");

if (resetButton) {
  resetButton.addEventListener(
    "click",
    requestPasswordReset
  );
}
}

async function enterApp() {
  const email =
    document
      .getElementById("loginEmail")
      ?.value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      ?.value;

  if (!email || !password) {

    showAuthError(
      "Email dan password wajib diisi."
    );

    return;
  }

  authLoading(true);
  showAuthError("");

  try {

    const {
      data,
      error
    } =
      await window.gpsSupabase.auth
        .signInWithPassword({
          email,
          password
        });

    if (error) throw error;

    const profile =
      await getCoachProfile(
        data.user.id
      );

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
        fullName:
          profile.full_name || "Coach"
      })
    );

    render();

  } catch (error) {

    console.error(
      "Login failed:",
      error
    );

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

window.requestPasswordReset = requestPasswordReset;
window.login = login;
window.enterApp = enterApp;
window.updatePassword = updatePassword;

window.addEventListener(
  "DOMContentLoaded",
  () => {

    window.gpsSupabase.auth.onAuthStateChange(
      (event) => {

        if (event === "PASSWORD_RECOVERY") {
          showPasswordRecovery();
        }

      }
    );

    login();
  }
);
      
