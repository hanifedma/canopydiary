(function () {
  "use strict";

  const LOCAL_KEY = "canopy-diary-local-v1";
  const LEGACY_LOCAL_KEY = "moss-diary-local-v1";
  const LOCAL_DB_NAME = "canopy-diary-local-db";
  const LOCAL_DB_VERSION = 1;
  const LOCAL_IMAGE_STORE = "images";
  const LOCAL_IMAGE_MAX_EDGE = 1280;
  const LOCAL_IMAGE_QUALITY = 0.78;
  const CLEAR_CONFIRM_TEXT = "DELETE ALL";
  const PLACEHOLDER_VALUES = new Set([
    "",
    "YOUR_SUPABASE_URL",
    "YOUR_SUPABASE_ANON_KEY",
    "https://YOUR_PROJECT_REF.supabase.co"
  ]);
  const SUPABASE_SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const SUPABASE_IMAGE_BUCKET = "diary-images";
  const SUPABASE_SIGNED_URL_SECONDS = 60 * 60 * 24;
  const SUPPORTED_IMAGE_TYPES = new Set([
    "image/gif",
    "image/heic",
    "image/heif",
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);
  const IMAGE_TYPES_BY_EXTENSION = new Map([
    ["gif", "image/gif"],
    ["heic", "image/heic"],
    ["heif", "image/heif"],
    ["jpeg", "image/jpeg"],
    ["jpg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"]
  ]);
  const ICON_PATHS = {
    "arrow-down-up": '<path d="m3 16 4 4 4-4"></path><path d="M7 20V4"></path><path d="m21 8-4-4-4 4"></path><path d="M17 4v16"></path>',
    "book-open-text": '<path d="M12 7v14"></path><path d="M3 5a7 7 0 0 1 7 0v14a7 7 0 0 0-7 0Z"></path><path d="M21 5a7 7 0 0 0-7 0v14a7 7 0 0 1 7 0Z"></path><path d="M7 9h2"></path><path d="M7 13h2"></path><path d="M15 9h2"></path><path d="M15 13h2"></path>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path>',
    "calendar-days": '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path>',
    "calendar-range": '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="M7 14h5"></path><path d="M14 18h3"></path>',
    "chevron-left": '<path d="m15 18-6-6 6-6"></path>',
    "chevron-right": '<path d="m9 18 6-6-6-6"></path>',
    cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.1-9.9A6 6 0 0 1 20 12.5 3.5 3.5 0 0 1 17.5 19Z"></path>',
    "cloud-check": '<path d="M17.5 19H8a5 5 0 1 1 1.1-9.9A6 6 0 0 1 20 12.5 3.5 3.5 0 0 1 17.5 19Z"></path><path d="m9 14 2 2 4-4"></path>',
    "cloud-off": '<path d="m2 2 20 20"></path><path d="M6.3 6.3A5 5 0 0 0 8 19h9.5c.9 0 1.7-.3 2.3-.9"></path><path d="M9.6 4.9A6 6 0 0 1 20 12.5c.7.4 1.2 1.1 1.4 1.9"></path>',
    "file-down": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path>',
    "image-plus": '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path><path d="M15 5v6"></path><path d="M12 8h6"></path>',
    images: '<rect x="3" y="3" width="14" height="14" rx="2"></rect><path d="M21 7v12a2 2 0 0 1-2 2H7"></path><circle cx="8" cy="8" r="1.4"></circle><path d="m4 15 4-4 3 3 2-2 3 3"></path>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-4.5 4.5-8 16-9-1 11.5-4.5 16-9 16Z"></path><path d="M4 20c4-4 8-7 13-9"></path>',
    "log-in": '<path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>',
    "log-out": '<path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>',
    "trash-2": '<path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>',
    "user-round": '<circle cx="12" cy="8" r="4"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>'
  };
  const DATE_FORMATTERS = {
    full: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    short: new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric"
    }),
    month: new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric"
    }),
    generated: new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  };

  const els = {
    appView: document.getElementById("appView"),
    accountAction: document.getElementById("accountAction"),
    accountDialog: document.getElementById("accountDialog"),
    closeAccountDialog: document.getElementById("closeAccountDialog"),
    authAction: document.getElementById("authAction"),
    deleteAllRecords: document.getElementById("deleteAllRecords"),
    avatar: document.getElementById("avatar"),
    userName: document.getElementById("userName"),
    modeBadge: document.getElementById("modeBadge"),
    noteDate: document.getElementById("noteDate"),
    noteDatePicker: document.getElementById("noteDatePicker"),
    prevDay: document.getElementById("prevDay"),
    nextDay: document.getElementById("nextDay"),
    todayButton: document.getElementById("todayButton"),
    weekdayLabel: document.getElementById("weekdayLabel"),
    noteTitle: document.getElementById("noteTitle"),
    noteText: document.getElementById("noteText"),
    saveState: document.getElementById("saveState"),
    uploadTrigger: document.getElementById("uploadTrigger"),
    photoInput: document.getElementById("photoInput"),
    dailyPhotos: document.getElementById("dailyPhotos"),
    historyMonth: document.getElementById("historyMonth"),
    historyMonthPicker: document.getElementById("historyMonthPicker"),
    historyList: document.getElementById("historyList"),
    galleryMonth: document.getElementById("galleryMonth"),
    gallerySort: document.getElementById("gallerySort"),
    galleryGrid: document.getElementById("galleryGrid"),
    openExportDialog: document.getElementById("openExportDialog"),
    exportDialog: document.getElementById("exportDialog"),
    closeExportDialog: document.getElementById("closeExportDialog"),
    cancelExport: document.getElementById("cancelExport"),
    exportStartDate: document.getElementById("exportStartDate"),
    exportStartPicker: document.getElementById("exportStartPicker"),
    exportEndDate: document.getElementById("exportEndDate"),
    exportEndPicker: document.getElementById("exportEndPicker"),
    exportSort: document.getElementById("exportSort"),
    exportSummary: document.getElementById("exportSummary"),
    confirmExport: document.getElementById("confirmExport"),
    printExport: document.getElementById("printExport"),
    imageDialog: document.getElementById("imageDialog"),
    closeDialog: document.getElementById("closeDialog"),
    dialogImage: document.getElementById("dialogImage"),
    dialogDate: document.getElementById("dialogDate"),
    dialogNoteTitle: document.getElementById("dialogNoteTitle"),
    dialogNoteText: document.getElementById("dialogNoteText"),
    deleteDialogImage: document.getElementById("deleteDialogImage"),
    clearDataDialog: document.getElementById("clearDataDialog"),
    closeClearDataDialog: document.getElementById("closeClearDataDialog"),
    cancelClearData: document.getElementById("cancelClearData"),
    clearDataMode: document.getElementById("clearDataMode"),
    clearDataCount: document.getElementById("clearDataCount"),
    clearDataConfirmInput: document.getElementById("clearDataConfirmInput"),
    confirmClearData: document.getElementById("confirmClearData"),
    toast: document.getElementById("toast")
  };

  const state = {
    backend: null,
    cloud: null,
    mode: "local",
    user: null,
    selectedDate: localDateKey(),
    notes: new Map(),
    images: [],
    currentView: "entry",
    activeDialogImageId: null,
    autoSaveTimer: null,
    noteTitleDate: null,
    noteTextDate: null,
    toastTimer: null,
    unsubscribeNotes: null,
    unsubscribeImages: null,
    renderFrame: null,
    localLoadToken: 0,
    signedImageUrls: new Map(),
    supabaseLoading: false,
    supabaseLoadFailed: false,
    galleryMonthSignature: "",
    supabaseReloadTimer: null
  };
  let localImageDbPromise = null;
  let supabaseSdkPromise = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindEvents();
    refreshIcons();

    els.noteDate.value = state.selectedDate;
    els.historyMonth.value = state.selectedDate.slice(0, 7);
    els.galleryMonth.value = "";
    els.gallerySort.value = "desc";

    signInLocal({ silent: true });

    if (hasSupabaseConfig()) {
      state.supabaseLoading = true;
      updateAuthAction();
      loadSupabaseSdk()
        .then(initSupabase)
        .catch(() => {
          state.supabaseLoading = false;
          state.supabaseLoadFailed = true;
          updateAuthAction();
          showToast("Google sync could not load. Local saving still works.");
        });
      return;
    }

    updateAuthAction();
  }

  function bindEvents() {
    els.accountAction.addEventListener("click", openAccountDialog);
    els.closeAccountDialog.addEventListener("click", closeAccountDialog);
    els.accountDialog.addEventListener("click", (event) => {
      if (event.target === els.accountDialog) {
        closeAccountDialog();
      }
    });

    els.authAction.addEventListener("click", () => {
      closeAccountDialog();
      if (state.supabaseLoading) {
        showToast("Google sync is still loading.");
        return;
      }
      if (state.supabaseLoadFailed) {
        showToast("Google sync could not load. Check the Supabase config or connection.");
        return;
      }
      if (state.mode === "supabase" && state.cloud && state.cloud.signOut) {
        state.cloud.signOut();
        return;
      }

      if (state.cloud && state.cloud.signIn) {
        state.cloud.signIn();
      } else {
        showToast("Google login is here. Add Supabase config to connect it.");
      }
    });

    document.querySelectorAll("[data-view-target]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.viewTarget));
    });

    els.noteDate.addEventListener("change", async () => {
      await flushAutoSave();
      await setSelectedDate(els.noteDate.value);
    });
    els.noteDatePicker.addEventListener("click", openDatePicker);
    els.prevDay.addEventListener("click", () => moveDate(-1));
    els.nextDay.addEventListener("click", () => moveDate(1));
    els.todayButton.addEventListener("click", async () => {
      await flushAutoSave();
      await setSelectedDate(localDateKey());
    });
    els.noteTitle.addEventListener("input", scheduleAutoSave);
    els.noteTitle.addEventListener("blur", flushAutoSave);
    els.noteText.addEventListener("input", scheduleAutoSave);
    els.noteText.addEventListener("blur", flushAutoSave);
    window.addEventListener("beforeunload", saveLocalDraftBeforeUnload);

    els.uploadTrigger.addEventListener("click", () => els.photoInput.click());
    els.photoInput.addEventListener("change", handlePhotoUpload);
    els.dailyPhotos.addEventListener("click", handleImageGridClick);

    els.historyMonth.addEventListener("change", renderHistory);
    els.historyMonthPicker.addEventListener("click", openHistoryMonthPicker);
    els.historyList.addEventListener("click", handleHistoryClick);
    els.galleryMonth.addEventListener("change", renderGallery);
    els.gallerySort.addEventListener("change", renderGallery);
    els.galleryGrid.addEventListener("click", handleImageGridClick);

    els.openExportDialog.addEventListener("click", openExportDialog);
    els.closeExportDialog.addEventListener("click", closeExportDialog);
    els.cancelExport.addEventListener("click", closeExportDialog);
    els.exportStartDate.addEventListener("change", updateExportSummary);
    els.exportEndDate.addEventListener("change", updateExportSummary);
    els.exportSort.addEventListener("change", updateExportSummary);
    els.exportStartPicker.addEventListener("click", () => openPicker(els.exportStartDate));
    els.exportEndPicker.addEventListener("click", () => openPicker(els.exportEndDate));
    els.confirmExport.addEventListener("click", requestPdfExport);
    els.exportDialog.addEventListener("click", (event) => {
      if (event.target === els.exportDialog) {
        closeExportDialog();
      }
    });

    els.closeDialog.addEventListener("click", () => closeImageDialog());
    els.deleteDialogImage.addEventListener("click", () => {
      if (state.activeDialogImageId) {
        requestDeleteImage(state.activeDialogImageId);
      }
    });
    els.imageDialog.addEventListener("click", (event) => {
      if (event.target === els.imageDialog) {
        closeImageDialog();
      }
    });

    els.deleteAllRecords.addEventListener("click", () => {
      closeAccountDialog();
      window.setTimeout(openClearDataDialog, 0);
    });
    els.closeClearDataDialog.addEventListener("click", closeClearDataDialog);
    els.cancelClearData.addEventListener("click", closeClearDataDialog);
    els.clearDataConfirmInput.addEventListener("input", updateClearDataConfirmState);
    els.confirmClearData.addEventListener("click", requestDeleteAllRecords);
    els.clearDataDialog.addEventListener("click", (event) => {
      if (event.target === els.clearDataDialog) {
        closeClearDataDialog();
      }
    });

    window.addEventListener("hashchange", syncViewFromHash);
    window.addEventListener("afterprint", clearPrintExport);
  }

  function hasSupabaseConfig() {
    const config = window.DIARY_SUPABASE_CONFIG || {};
    return ["url", "anonKey"].every((key) => {
      const value = String(config[key] || "").trim();
      return value && !PLACEHOLDER_VALUES.has(value);
    });
  }

  function loadSupabaseSdk() {
    if (window.supabase) {
      return Promise.resolve();
    }

    if (!supabaseSdkPromise) {
      supabaseSdkPromise = loadScript(SUPABASE_SDK_URL);
    }

    return supabaseSdkPromise;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing && existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      const script = existing || document.createElement("script");
      script.src = src;
      script.defer = true;
      script.async = false;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => reject(new Error(`Could not load ${src}`));

      if (!existing) {
        document.head.appendChild(script);
      }
    });
  }

  function initSupabase() {
    if (!window.supabase) {
      throw new Error("Supabase SDK did not load.");
    }
    const { url, anonKey } = window.DIARY_SUPABASE_CONFIG;
    const client = window.supabase.createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    });

    state.cloud = {
      signIn: () => signInSupabase(client),
      signOut: () => client.auth.signOut(),
      saveNote: (date, title, text) => saveSupabaseNote(client, date, title, text),
      deleteNote: (date) => deleteSupabaseNote(client, date),
      uploadImages: (date, files) => uploadSupabaseImages(client, date, files),
      deleteImage: (image) => deleteSupabaseImage(client, image),
      deleteAllRecords: () => deleteAllSupabaseRecords(client),
      listen: (user) => listenSupabaseData(client, user)
    };
    state.supabaseLoading = false;
    state.supabaseLoadFailed = false;

    client.auth.onAuthStateChange((_event, session) => {
      handleSupabaseSession(session);
    });
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }
        handleSupabaseSession(data.session);
      })
      .catch((error) => {
        state.supabaseLoadFailed = true;
        updateAuthAction();
        showToast(error.message || "Could not prepare Google sync.");
        signInLocal({ silent: true });
      });

    updateAuthAction();

    function handleSupabaseSession(session) {
      const user = session && session.user;
      if (!user) {
        if (state.mode === "supabase" || !state.user) {
          signInLocal({ silent: true });
        }
        updateAuthAction();
        return;
      }

      state.localLoadToken += 1;
      state.mode = "supabase";
      state.user = normalizeSupabaseUser(user);
      state.backend = state.cloud;
      showApp();
      state.cloud.listen(user);
    }
  }

  async function signInLocal(options = {}) {
    const store = readLocalStore();
    const immediatelyAvailableImages = mergeImageArrays(readLegacyLocalStore().images, store.images || []).sort(
      sortImagesNewestFirst
    );
    const loadToken = state.localLoadToken + 1;
    state.localLoadToken = loadToken;
    stopDataListeners();
    state.mode = "local";
    state.signedImageUrls.clear();
    state.backend = {
      saveNote: saveLocalNote,
      deleteNote: deleteLocalNote,
      uploadImages: uploadLocalImages,
      deleteImage: deleteLocalImage,
      deleteAllRecords: deleteAllLocalRecords,
      listen: listenLocalData
    };
    state.user = {
      uid: "local-preview",
      displayName: "Saved locally",
      email: "",
      photoURL: ""
    };
    state.notes = normalizeNotes(store.notes || {});
    state.images = immediatelyAvailableImages;
    showApp();
    listenLocalData();
    if (!options.silent) {
      showToast("Saving this diary locally on this device.");
    }

    scheduleIdleTask(async () => {
      try {
        const durableImages = await loadLocalImages(store);
        if (state.mode !== "local" || state.localLoadToken !== loadToken) {
          return;
        }
        state.images = durableImages;
        requestRenderAll();
      } catch (error) {
        if (!options.silent && state.mode === "local" && state.localLoadToken === loadToken) {
          showToast("Could not load local pictures. New uploads will still be saved.");
        }
      }
    });
  }

  function showApp() {
    els.appView.classList.remove("hidden");
    els.modeBadge.textContent = state.mode === "supabase" ? "Cloud" : "Local";
    els.userName.textContent = state.user.displayName || state.user.email || "Diary";
    if (state.user.photoURL) {
      els.avatar.src = state.user.photoURL;
      els.avatar.classList.remove("hidden");
    } else {
      els.avatar.classList.add("hidden");
    }
    updateAuthAction();
    if (!syncViewFromHash()) {
      renderAll();
    }
  }

  function updateAuthAction() {
    let accountConfig = ["user-round", "Sign in", "Open account options"];
    let authConfig = ["log-in", "Continue with Google", "Add Supabase config to enable Google sign-in"];
    let authDisabled = false;

    if (state.mode === "supabase") {
      accountConfig = ["user-round", "Account", "Open account options"];
      authConfig = ["log-out", "Sign out", "Sign out of Google"];
    } else if (state.supabaseLoading) {
      authConfig = ["cloud", "Loading Google sync", "Google sync is loading"];
      authDisabled = true;
    } else if (state.supabaseLoadFailed) {
      authConfig = ["cloud-off", "Google unavailable", "Google sync could not load"];
    } else if (state.cloud && state.cloud.signIn) {
      authConfig = ["log-in", "Continue with Google", "Sign in with Google for cloud storage"];
    }

    setAccountAction(...accountConfig);
    setAuthAction(...authConfig);
    els.authAction.classList.remove("hidden");
    els.authAction.disabled = authDisabled;
    refreshIcons(els.accountAction);
    refreshIcons(els.authAction);
  }

  function setAccountAction(icon, label, title) {
    els.accountAction.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
    els.accountAction.setAttribute("aria-label", title);
    els.accountAction.setAttribute("title", title);
  }

  function setAuthAction(icon, label, title) {
    els.authAction.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
    els.authAction.setAttribute("aria-label", title);
    els.authAction.setAttribute("title", title);
  }

  async function saveCurrentNote(options = {}) {
    const date = state.selectedDate;
    const title = els.noteTitle.value.trim();
    const text = els.noteText.value;
    const existing = state.notes.get(date);
    const existingTitle = existing && typeof existing.title === "string" ? existing.title : "";
    const existingText = existing && typeof existing.text === "string" ? existing.text : "";
    const hasContent = Boolean(title || text.trim());

    if (!existing && !hasContent) {
      setSaveState("Autosave ready");
      return;
    }

    if (!hasContent) {
      setSaveState("Saving...");
      try {
        await state.backend.deleteNote(date);
        setSaveState("Saved");
      } catch (error) {
        setSaveState("Could not autosave");
        showToast(error.message || "Could not save note.");
      }
      return;
    }

    if (existingTitle === title && existingText === text) {
      setSaveState("Saved");
      return;
    }

    setSaveState("Saving...");
    try {
      await state.backend.saveNote(date, title, text);
      setSaveState("Saved");
      if (options.toast) {
        showToast("Note saved.");
      }
    } catch (error) {
      setSaveState("Could not autosave");
      showToast(error.message || "Could not save note.");
    }
  }

  function scheduleAutoSave() {
    state.noteTitleDate = state.selectedDate;
    state.noteTextDate = state.selectedDate;
    window.clearTimeout(state.autoSaveTimer);
    setSaveState("Writing...");
    state.autoSaveTimer = window.setTimeout(() => {
      state.autoSaveTimer = null;
      saveCurrentNote();
    }, 800);
  }

  async function flushAutoSave() {
    if (!state.autoSaveTimer) {
      return;
    }
    window.clearTimeout(state.autoSaveTimer);
    state.autoSaveTimer = null;
    await saveCurrentNote();
  }

  function saveLocalDraftBeforeUnload() {
    if (state.mode !== "local" || !state.autoSaveTimer) {
      return;
    }

    const store = readLocalStore();
    const title = els.noteTitle.value.trim();
    const text = els.noteText.value;
    if (title || text.trim()) {
      store.notes[state.selectedDate] = {
        date: state.selectedDate,
        title,
        text,
        updatedAt: new Date().toISOString()
      };
    } else {
      delete store.notes[state.selectedDate];
    }
    writeLocalStore(store);
  }

  async function handlePhotoUpload() {
    const selectedFiles = Array.from(els.photoInput.files || []);
    const files = selectedFiles.filter(isSupportedImageFile);
    els.photoInput.value = "";

    if (!files.length) {
      if (selectedFiles.length) {
        showToast("Use JPG, PNG, WebP, GIF, HEIC, or HEIF pictures.");
      }
      return;
    }

    els.uploadTrigger.disabled = true;
    showToast(files.length === 1 ? "Uploading picture..." : "Uploading pictures...");
    try {
      await state.backend.uploadImages(state.selectedDate, files);
      showToast("Pictures added.");
    } catch (error) {
      showToast(error.message || "Could not upload pictures.");
    } finally {
      els.uploadTrigger.disabled = false;
    }
  }

  async function requestDeleteImage(imageId) {
    const image = state.images.find((item) => item.id === imageId);
    if (!image) {
      return;
    }

    const name = image.name ? `"${image.name}"` : "this picture";
    const confirmed = window.confirm(`Delete ${name}?\n\nThis removes only the picture, not the note.`);
    if (!confirmed) {
      return;
    }

    showToast("Deleting picture...");
    try {
      await state.backend.deleteImage(image);
      if (state.activeDialogImageId === imageId) {
        closeImageDialog();
      }
      showToast("Picture deleted.");
    } catch (error) {
      showToast(error.message || "Could not delete picture.");
    }
  }

  function handleImageGridClick(event) {
    const button = event.target.closest("[data-image-id]");
    if (!button || !event.currentTarget.contains(button)) {
      return;
    }
    openImageDialog(button.dataset.imageId);
  }

  async function handleHistoryClick(event) {
    const button = event.target.closest("[data-date]");
    if (!button || !event.currentTarget.contains(button)) {
      return;
    }
    await setSelectedDate(button.dataset.date);
  }

  function openAccountDialog() {
    updateAuthAction();
    if (typeof els.accountDialog.showModal === "function") {
      els.accountDialog.showModal();
    } else {
      els.accountDialog.setAttribute("open", "");
    }
    window.setTimeout(() => els.authAction.focus(), 0);
  }

  function closeAccountDialog() {
    if (!els.accountDialog.hasAttribute("open")) {
      return;
    }
    if (typeof els.accountDialog.close === "function") {
      els.accountDialog.close();
    } else {
      els.accountDialog.removeAttribute("open");
    }
  }

  function openClearDataDialog() {
    const counts = getRecordCounts();
    if (!counts.notes && !counts.images) {
      showToast("No records to delete.");
      return;
    }

    els.clearDataMode.textContent = state.mode === "supabase" ? "Cloud records" : "Local records";
    els.clearDataCount.textContent = `${formatCount(counts.notes, "note")} and ${formatCount(
      counts.images,
      "picture"
    )} will be deleted.`;
    els.clearDataConfirmInput.value = "";
    updateClearDataConfirmState();

    if (typeof els.clearDataDialog.showModal === "function") {
      els.clearDataDialog.showModal();
    } else {
      els.clearDataDialog.setAttribute("open", "");
    }

    window.setTimeout(() => els.clearDataConfirmInput.focus(), 0);
  }

  function closeClearDataDialog() {
    els.clearDataConfirmInput.value = "";
    updateClearDataConfirmState();
    if (typeof els.clearDataDialog.close === "function") {
      els.clearDataDialog.close();
    } else {
      els.clearDataDialog.removeAttribute("open");
    }
  }

  function updateClearDataConfirmState() {
    els.confirmClearData.disabled = els.clearDataConfirmInput.value.trim() !== CLEAR_CONFIRM_TEXT;
  }

  async function requestDeleteAllRecords() {
    if (els.clearDataConfirmInput.value.trim() !== CLEAR_CONFIRM_TEXT || !state.backend) {
      updateClearDataConfirmState();
      return;
    }

    setDeleteAllBusy(true);
    showToast("Deleting all records...");
    clearPendingAutoSave();

    try {
      await state.backend.deleteAllRecords();
      resetRecordsInMemory();
      closeImageDialog();
      closeClearDataDialog();
      renderAll();
      showToast("All records deleted.");
    } catch (error) {
      updateClearDataConfirmState();
      showToast(error.message || "Could not delete all records.");
    } finally {
      setDeleteAllBusy(false);
    }
  }

  function setDeleteAllBusy(isBusy) {
    els.deleteAllRecords.disabled = isBusy;
    els.closeClearDataDialog.disabled = isBusy;
    els.cancelClearData.disabled = isBusy;
    els.clearDataConfirmInput.disabled = isBusy;
    els.confirmClearData.disabled = isBusy || els.clearDataConfirmInput.value.trim() !== CLEAR_CONFIRM_TEXT;
  }

  function getRecordCounts() {
    return {
      notes: state.notes.size,
      images: state.images.length
    };
  }

  async function openExportDialog() {
    await flushAutoSave();

    const range = getDefaultExportRange();
    els.exportStartDate.value = range.start;
    els.exportEndDate.value = range.end;
    els.exportSort.value = "asc";
    updateExportSummary();

    if (typeof els.exportDialog.showModal === "function") {
      els.exportDialog.showModal();
    } else {
      els.exportDialog.setAttribute("open", "");
    }

    window.setTimeout(() => els.exportStartDate.focus(), 0);
  }

  function closeExportDialog() {
    if (typeof els.exportDialog.close === "function") {
      els.exportDialog.close();
    } else {
      els.exportDialog.removeAttribute("open");
    }
  }

  function getDefaultExportRange() {
    const dates = getKnownDates(getImageIndexByDate()).sort((a, b) => a.localeCompare(b));
    if (!dates.length) {
      const today = localDateKey();
      return { start: today, end: today };
    }

    return {
      start: dates[0],
      end: dates[dates.length - 1]
    };
  }

  function updateExportSummary() {
    const range = getSelectedExportRange();
    if (!range) {
      els.exportSummary.textContent = "Choose a valid date range.";
      els.confirmExport.disabled = true;
      return;
    }

    const entries = getExportEntries(range.start, range.end, els.exportSort.value);
    const noteCount = entries.filter((entry) => noteHasContent(entry.note)).length;
    const imageCount = entries.reduce((total, entry) => total + entry.images.length, 0);

    els.exportSummary.textContent = entries.length
      ? `${formatCount(entries.length, "day")}, ${formatCount(noteCount, "note")}, ${formatCount(imageCount, "picture")}.`
      : "No records in this range.";
    els.confirmExport.disabled = !entries.length;
  }

  function getSelectedExportRange() {
    const start = validDateKey(els.exportStartDate.value);
    const end = validDateKey(els.exportEndDate.value);
    if (!start || !end || start > end) {
      return null;
    }

    return { start, end };
  }

  async function requestPdfExport() {
    await flushAutoSave();

    const range = getSelectedExportRange();
    if (!range) {
      updateExportSummary();
      showToast("Choose a valid date range.");
      return;
    }

    const entries = getExportEntries(range.start, range.end, els.exportSort.value);
    if (!entries.length) {
      updateExportSummary();
      showToast("No records in this range.");
      return;
    }

    setExportBusy(true);
    try {
      renderPrintExport(entries, range);
      await waitForPrintImages(els.printExport);
      closeExportDialog();
      window.setTimeout(() => {
        window.print();
        window.setTimeout(clearPrintExport, 60000);
      }, 80);
    } catch (error) {
      showToast(error.message || "Could not create PDF.");
    } finally {
      setExportBusy(false);
    }
  }

  function setExportBusy(isBusy) {
    els.closeExportDialog.disabled = isBusy;
    els.cancelExport.disabled = isBusy;
    els.exportStartDate.disabled = isBusy;
    els.exportStartPicker.disabled = isBusy;
    els.exportEndDate.disabled = isBusy;
    els.exportEndPicker.disabled = isBusy;
    els.exportSort.disabled = isBusy;
    els.confirmExport.disabled = isBusy || !getExportEntriesForSelection().length;
  }

  function getExportEntriesForSelection() {
    const range = getSelectedExportRange();
    return range ? getExportEntries(range.start, range.end, els.exportSort.value) : [];
  }

  function getExportEntries(start, end, sortDirection) {
    const direction = sortDirection === "desc" ? "desc" : "asc";
    const imageIndex = getImageIndexByDate();
    return getKnownDates(imageIndex)
      .filter((date) => date >= start && date <= end)
      .sort((a, b) => (direction === "asc" ? a.localeCompare(b) : b.localeCompare(a)))
      .map((date) => ({
        date,
        note: state.notes.get(date) || null,
        images: [...(imageIndex.get(date) || [])].sort(sortExportImages)
      }));
  }

  function sortExportImages(a, b) {
    const uploadCompare = getTimestamp(a.uploadedAt) - getTimestamp(b.uploadedAt);
    if (uploadCompare !== 0) {
      return uploadCompare;
    }

    return String(a.id || "").localeCompare(String(b.id || ""));
  }

  function renderPrintExport(entries, range) {
    const imageCount = entries.reduce((total, entry) => total + entry.images.length, 0);
    const generatedAt = DATE_FORMATTERS.generated.format(new Date());

    els.printExport.setAttribute("aria-hidden", "false");
    els.printExport.innerHTML = `
      <section class="print-cover">
        <p class="print-kicker">CanopyDiary</p>
        <h1>Diary Archive</h1>
        <p class="print-range">${escapeHtml(fullDateLabel(range.start))} - ${escapeHtml(fullDateLabel(range.end))}</p>
        <p class="print-meta">${escapeHtml(formatCount(entries.length, "day"))} / ${escapeHtml(
          formatCount(imageCount, "picture")
        )} / Generated ${escapeHtml(generatedAt)}</p>
      </section>
      ${entries.map(renderPrintEntry).join("")}
    `;
  }

  function renderPrintEntry(entry) {
    const note = entry.note;
    const title = note && note.title && note.title.trim() ? note.title.trim() : "Untitled entry";
    const text = note && note.text && note.text.trim() ? note.text.trim() : "No written note.";
    const images = entry.images.length
      ? `
        <div class="print-image-grid">
          ${entry.images.map(renderPrintImage).join("")}
        </div>
      `
      : "";

    return `
      <article class="print-entry">
        <p class="print-date">${escapeHtml(fullDateLabel(entry.date))}</p>
        <h2>${escapeHtml(title)}</h2>
        <div class="print-note">${escapeHtml(text)}</div>
        ${images}
      </article>
    `;
  }

  function renderPrintImage(image) {
    const uploaded = uploadLabel(image.uploadedAt, image.date);
    const caption = [image.name || "Diary picture", uploaded ? `Uploaded ${uploaded}` : ""].filter(Boolean).join(" / ");
    return `
      <figure class="print-image">
        <img src="${escapeAttribute(image.url)}" alt="${escapeAttribute(image.name || "Diary picture")}" />
        <figcaption>${escapeHtml(caption)}</figcaption>
      </figure>
    `;
  }

  function waitForPrintImages(container) {
    const images = Array.from(container.querySelectorAll("img"));
    if (!images.length) {
      return Promise.resolve();
    }

    const imagePromises = images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        })
    );

    return Promise.race([Promise.allSettled(imagePromises), delay(2800)]);
  }

  function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function scheduleIdleTask(task) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(task, { timeout: 1200 });
      return;
    }

    window.setTimeout(task, 80);
  }

  function clearPrintExport() {
    els.printExport.innerHTML = "";
    els.printExport.setAttribute("aria-hidden", "true");
  }

  function formatCount(count, label) {
    return `${count} ${label}${count === 1 ? "" : "s"}`;
  }

  function clearPendingAutoSave() {
    window.clearTimeout(state.autoSaveTimer);
    state.autoSaveTimer = null;
  }

  function resetRecordsInMemory() {
    state.notes = new Map();
    state.images = [];
    state.activeDialogImageId = null;
    state.noteTitleDate = null;
    state.noteTextDate = null;
    els.galleryMonth.value = "";
    state.galleryMonthSignature = "";
    state.signedImageUrls.clear();
    setSaveState("Autosave ready");
  }

  function listenLocalData() {
    renderAll();
  }

  function saveLocalNote(date, title, text) {
    const store = readLocalStore();
    const note = {
      date,
      title,
      text,
      updatedAt: new Date().toISOString()
    };
    store.notes[date] = note;
    writeLocalStore(store);
    state.notes.set(date, note);
    if (state.currentView === "entry") {
      renderHistory();
    }
    if (els.exportDialog.hasAttribute("open")) {
      updateExportSummary();
    }
    return Promise.resolve();
  }

  function deleteLocalNote(date) {
    const store = readLocalStore();
    delete store.notes[date];
    writeLocalStore(store);
    state.notes.delete(date);
    if (state.currentView === "entry") {
      renderHistory();
    }
    if (els.exportDialog.hasAttribute("open")) {
      updateExportSummary();
    }
    return Promise.resolve();
  }

  async function uploadLocalImages(date, files) {
    const entryDate = validDateKey(date) || localDateKey();
    const additions = [];
    for (const file of files) {
      const prepared = await prepareDiaryImage(file);
      additions.push({
        id: createId(),
        date: entryDate,
        url: prepared.url,
        name: file.name,
        size: prepared.size,
        originalSize: file.size,
        contentType: prepared.contentType,
        width: prepared.width,
        height: prepared.height,
        uploadedAt: new Date().toISOString()
      });
    }
    await saveLocalImageRecords(additions);
    state.images = [...additions, ...state.images].sort(sortImagesNewestFirst);
    renderAll();
  }

  async function deleteLocalImage(image) {
    await removeLocalImageRecord(image.id);
    state.images = state.images.filter((item) => item.id !== image.id);
    renderAll();
  }

  async function deleteAllLocalRecords() {
    localStorage.removeItem(LOCAL_KEY);
    localStorage.removeItem(LEGACY_LOCAL_KEY);

    const db = await openLocalImageDb();
    if (db) {
      await clearLocalImageRecords(db);
    }
  }

  function readLocalStore() {
    migrateLegacyLocalStore();
    return parseLocalStore(localStorage.getItem(LOCAL_KEY));
  }

  function migrateLegacyLocalStore() {
    if (localStorage.getItem(LOCAL_KEY) || !localStorage.getItem(LEGACY_LOCAL_KEY)) {
      return;
    }
    const legacyStore = parseLocalStore(localStorage.getItem(LEGACY_LOCAL_KEY));
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ notes: legacyStore.notes, images: [] }));
    } catch (error) {
      // The legacy store may contain large pictures. Keep reading it directly instead.
    }
  }

  function writeLocalStore(store) {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({
        notes: store.notes || {},
        images: Array.isArray(store.images) ? store.images : []
      })
    );
  }

  function parseLocalStore(raw) {
    if (!raw) {
      return { notes: {}, images: [] };
    }

    try {
      const store = JSON.parse(raw) || {};
      return {
        notes: store.notes && typeof store.notes === "object" ? store.notes : {},
        images: normalizeImages(store.images || [])
      };
    } catch (error) {
      return { notes: {}, images: [] };
    }
  }

  function readLegacyLocalStore() {
    return parseLocalStore(localStorage.getItem(LEGACY_LOCAL_KEY));
  }

  async function loadLocalImages(store) {
    const legacyImages = readLegacyLocalStore().images;
    const localStorageImages = mergeImageArrays(legacyImages, store.images || []);
    const db = await openLocalImageDb();

    if (!db) {
      return localStorageImages.sort(sortImagesNewestFirst);
    }

    const indexedImages = normalizeImages(await readAllLocalImageRecords(db));
    const mergedImages = mergeImageArrays(localStorageImages, indexedImages).sort(sortImagesNewestFirst);
    const indexedIds = new Set(indexedImages.map((image) => image.id));
    const missingImages = localStorageImages.filter((image) => !indexedIds.has(image.id));

    if (missingImages.length) {
      await putLocalImageRecords(db, missingImages);
    }

    if (Array.isArray(store.images) && store.images.length) {
      try {
        writeLocalStore({ ...store, images: [] });
      } catch (error) {
        // If clearing old localStorage images fails, IndexedDB still has the migrated copy.
      }
    }

    return mergedImages;
  }

  async function saveLocalImageRecords(images) {
    const db = await openLocalImageDb();
    if (db) {
      await putLocalImageRecords(db, images);
      return;
    }

    const store = readLocalStore();
    store.images = mergeImageArrays(images, store.images || []).sort(sortImagesNewestFirst);
    writeLocalStore(store);
  }

  async function removeLocalImageRecord(imageId) {
    const db = await openLocalImageDb();
    if (db) {
      await deleteLocalImageRecord(db, imageId);
    }

    const store = readLocalStore();
    if (store.images.some((image) => image.id === imageId)) {
      store.images = store.images.filter((image) => image.id !== imageId);
      writeLocalStore(store);
    }
  }

  function openLocalImageDb() {
    if (!("indexedDB" in window)) {
      return Promise.resolve(null);
    }

    if (!localImageDbPromise) {
      localImageDbPromise = new Promise((resolve) => {
        let settled = false;
        const finish = (db) => {
          if (settled) {
            return;
          }
          settled = true;
          window.clearTimeout(timeout);
          resolve(db);
        };
        const timeout = window.setTimeout(() => finish(null), 1800);
        const request = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(LOCAL_IMAGE_STORE)) {
            db.createObjectStore(LOCAL_IMAGE_STORE, { keyPath: "id" });
          }
        };

        request.onsuccess = () => finish(request.result);
        request.onerror = () => finish(null);
        request.onblocked = () => finish(null);
      });
    }

    return localImageDbPromise;
  }

  function readAllLocalImageRecords(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOCAL_IMAGE_STORE, "readonly");
      const store = transaction.objectStore(LOCAL_IMAGE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function putLocalImageRecords(db, images) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOCAL_IMAGE_STORE, "readwrite");
      const store = transaction.objectStore(LOCAL_IMAGE_STORE);

      images.forEach((image) => store.put(image));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function deleteLocalImageRecord(db, imageId) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOCAL_IMAGE_STORE, "readwrite");
      const store = transaction.objectStore(LOCAL_IMAGE_STORE);

      store.delete(imageId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function clearLocalImageRecords(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOCAL_IMAGE_STORE, "readwrite");
      const store = transaction.objectStore(LOCAL_IMAGE_STORE);

      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function mergeImageArrays(...groups) {
    const imagesById = new Map();
    groups.flat().forEach((image) => {
      if (image && image.id && image.url) {
        imagesById.set(image.id, image);
      }
    });
    return Array.from(imagesById.values());
  }

  function normalizeNotes(notes) {
    const entries = Array.isArray(notes) ? notes.map((note) => [note.id || note.date, note]) : Object.entries(notes);
    const normalized = new Map();

    entries.forEach(([key, note]) => {
      const date = validDateKey((note && note.date) || key);
      if (!date || !note || typeof note !== "object") {
        return;
      }

      normalized.set(date, {
        ...note,
        date,
        title: typeof note.title === "string" ? note.title : "",
        text: typeof note.text === "string" ? note.text : ""
      });
    });

    return normalized;
  }

  function normalizeImages(images) {
    if (!Array.isArray(images)) {
      return [];
    }

    return images
      .map((image, index) => {
        if (!image || typeof image !== "object" || !image.url) {
          return null;
        }

        const fallbackId = [
          "local",
          image.date || "undated",
          image.uploadedAt || "unknown",
          image.name || "picture",
          index
        ].join("-");

        return {
          ...image,
          id: String(image.id || fallbackId),
          date: typeof image.date === "string" ? image.date : "",
          name: typeof image.name === "string" ? image.name : "Diary picture",
          url: String(image.url),
          uploadedAt: image.uploadedAt || image.date || ""
        };
      })
      .filter(Boolean);
  }

  function sortImagesNewestFirst(a, b) {
    const uploadCompare = getTimestamp(b.uploadedAt) - getTimestamp(a.uploadedAt);
    if (uploadCompare !== 0) {
      return uploadCompare;
    }
    return String(b.date || "").localeCompare(String(a.date || ""));
  }

  function sortGalleryImagesByEntryDate(a, b, direction) {
    const entryCompare = compareEntryDateKeys(imageEntryDateKey(a), imageEntryDateKey(b), direction);
    if (entryCompare !== 0) {
      return entryCompare;
    }

    const uploadCompare = getTimestamp(b.uploadedAt) - getTimestamp(a.uploadedAt);
    if (uploadCompare !== 0) {
      return uploadCompare;
    }

    return String(a.id || "").localeCompare(String(b.id || ""));
  }

  function compareEntryDateKeys(a, b, direction) {
    const left = validDateKey(a);
    const right = validDateKey(b);
    if (!left && !right) {
      return 0;
    }
    if (!left) {
      return 1;
    }
    if (!right) {
      return -1;
    }

    const dateCompare = left.localeCompare(right);
    return direction === "asc" ? dateCompare : -dateCompare;
  }

  function readFileAsDataUrl(file) {
    return readBlobAsDataUrl(file);
  }

  function readBlobAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function prepareDiaryImage(file) {
    if (!canResizeImage(file)) {
      return readOriginalImage(file);
    }
    if (!window.URL || typeof URL.createObjectURL !== "function") {
      return readOriginalImage(file);
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImageElement(objectUrl);
      const scale = Math.min(1, LOCAL_IMAGE_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      if (scale === 1 && file.size < 900000) {
        return readOriginalImage(file, image.naturalWidth, image.naturalHeight);
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        return readOriginalImage(file, image.naturalWidth, image.naturalHeight);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const compressedBlob = await canvasToBlob(canvas, "image/jpeg", LOCAL_IMAGE_QUALITY);
      if (!compressedBlob || compressedBlob.size >= file.size) {
        return readOriginalImage(file, image.naturalWidth, image.naturalHeight);
      }

      return {
        url: await readBlobAsDataUrl(compressedBlob),
        size: compressedBlob.size,
        contentType: "image/jpeg",
        width: canvas.width,
        height: canvas.height
      };
    } catch (error) {
      return readOriginalImage(file);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function readOriginalImage(file, width = null, height = null) {
    const url = await readFileAsDataUrl(file);
    return {
      url,
      size: dataUrlSize(url),
      contentType: imageContentType(file) || "application/octet-stream",
      width,
      height
    };
  }

  function canvasToBlob(canvas, contentType, quality) {
    if (typeof canvas.toBlob !== "function") {
      const url = canvas.toDataURL(contentType, quality);
      return Promise.resolve(dataUrlToBlob(url, contentType));
    }

    return new Promise((resolve) => {
      canvas.toBlob(resolve, contentType, quality);
    });
  }

  function canResizeImage(file) {
    const contentType = imageContentType(file);
    return (
      typeof document !== "undefined" &&
      typeof document.createElement === "function" &&
      /^(image\/jpeg|image\/png|image\/webp)$/i.test(contentType)
    );
  }

  function isSupportedImageFile(file) {
    return Boolean(imageContentType(file));
  }

  function imageContentType(file) {
    const contentType = String((file && file.type) || "").toLowerCase();
    if (contentType === "image/jpg") {
      return "image/jpeg";
    }
    if (SUPPORTED_IMAGE_TYPES.has(contentType)) {
      return contentType;
    }

    const extension = String((file && file.name) || "")
      .split(".")
      .pop()
      .toLowerCase();
    return IMAGE_TYPES_BY_EXTENSION.get(extension) || "";
  }

  function loadImageElement(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read image."));
      image.src = url;
    });
  }

  function dataUrlSize(url) {
    const base64 = String(url).split(",")[1] || "";
    return Math.round((base64.length * 3) / 4);
  }

  function dataUrlToBlob(url, contentType) {
    const parts = String(url).split(",");
    const base64 = parts[1] || "";
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: contentType || "application/octet-stream" });
  }

  function safeFileName(name) {
    return String(name || "picture.jpg")
      .replace(/[^a-z0-9._-]/gi, "_")
      .slice(0, 90) || "picture.jpg";
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeSupabaseUser(user) {
    const metadata = user.user_metadata || {};
    return {
      uid: user.id,
      displayName: metadata.full_name || metadata.name || user.email || "",
      email: user.email || "",
      photoURL: metadata.avatar_url || metadata.picture || ""
    };
  }

  async function getSupabaseUser(client) {
    const { data, error } = await client.auth.getUser();
    if (error) {
      throw error;
    }
    if (!data.user || !data.user.id) {
      throw new Error("Sign in again to use cloud storage.");
    }
    return data.user;
  }

  function isActiveSupabaseUser(userId) {
    return state.mode === "supabase" && state.user && state.user.uid === userId;
  }

  async function signInSupabase(client) {
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthRedirectUrl(),
        queryParams: {
          prompt: "select_account"
        }
      }
    });
    if (error) {
      showToast(error.message || "Google sign-in failed.");
    }
  }

  function getAuthRedirectUrl() {
    return `${window.location.origin}${window.location.pathname || "/"}`;
  }

  function listenSupabaseData(client, user) {
    stopDataListeners();
    loadSupabaseData(client, user).catch((error) => showToast(error.message || "Could not load cloud records."));

    const channel = client
      .channel(`canopydiary-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diary_notes", filter: `user_id=eq.${user.id}` },
        () => scheduleSupabaseDataLoad(client, user)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diary_images", filter: `user_id=eq.${user.id}` },
        () => scheduleSupabaseDataLoad(client, user)
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          showToast("Live sync disconnected. Reload if changes stop appearing.");
        }
      });

    state.unsubscribeNotes = () => {
      client.removeChannel(channel);
    };
  }

  function stopDataListeners() {
    if (state.supabaseReloadTimer) {
      window.clearTimeout(state.supabaseReloadTimer);
      state.supabaseReloadTimer = null;
    }
    if (state.unsubscribeNotes) {
      state.unsubscribeNotes();
    }
    if (state.unsubscribeImages) {
      state.unsubscribeImages();
    }
    state.unsubscribeNotes = null;
    state.unsubscribeImages = null;
  }

  function scheduleSupabaseDataLoad(client, user) {
    window.clearTimeout(state.supabaseReloadTimer);
    state.supabaseReloadTimer = window.setTimeout(() => {
      state.supabaseReloadTimer = null;
      loadSupabaseData(client, user).catch((error) => showToast(error.message || "Could not refresh cloud records."));
    }, 250);
  }

  async function loadSupabaseData(client, user) {
    if (!isActiveSupabaseUser(user.id)) {
      return;
    }

    const [notesResponse, imagesResponse] = await Promise.all([
      client.from("diary_notes").select("date,title,text,updated_at").eq("user_id", user.id).order("date", {
        ascending: false
      }),
      client
        .from("diary_images")
        .select("id,date,storage_path,name,size,original_size,content_type,width,height,uploaded_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("uploaded_at", { ascending: false })
    ]);

    if (notesResponse.error) {
      throw notesResponse.error;
    }
    if (imagesResponse.error) {
      throw imagesResponse.error;
    }
    if (!isActiveSupabaseUser(user.id)) {
      return;
    }

    const nextNotes = normalizeNotes((notesResponse.data || []).map(supabaseNoteToAppNote));
    const nextImages = normalizeImages(await supabaseImageRowsToAppImages(client, imagesResponse.data || [])).sort(
      sortImagesNewestFirst
    );
    if (!isActiveSupabaseUser(user.id)) {
      return;
    }

    state.notes = nextNotes;
    state.images = nextImages;
    requestRenderAll();
  }

  function supabaseNoteToAppNote(row) {
    return {
      date: row.date,
      title: row.title || "",
      text: row.text || "",
      updatedAt: row.updated_at || ""
    };
  }

  async function supabaseImageRowsToAppImages(client, rows) {
    const paths = rows.map((row) => row.storage_path).filter(Boolean);
    const signedUrls = await createSupabaseSignedUrlMap(client, paths);
    return rows.map((row) => ({
      id: String(row.id),
      date: row.date,
      url: signedUrls.get(row.storage_path) || "",
      storagePath: row.storage_path,
      name: row.name || "Diary picture",
      size: row.size || 0,
      originalSize: row.original_size || row.size || 0,
      contentType: row.content_type || "",
      width: row.width || null,
      height: row.height || null,
      uploadedAt: row.uploaded_at || row.date || ""
    }));
  }

  async function createSupabaseSignedUrlMap(client, paths) {
    const signedUrls = new Map();
    const uniquePaths = Array.from(new Set(paths));
    const expiresAfter = Date.now() + SUPABASE_SIGNED_URL_SECONDS * 1000;
    const pathsToSign = uniquePaths.filter((path) => {
      const cached = state.signedImageUrls.get(path);
      if (cached && cached.expiresAt > Date.now() + 60000) {
        signedUrls.set(path, cached.url);
        return false;
      }
      return true;
    });

    for (const chunk of chunkArray(pathsToSign, 100)) {
      const { data, error } = await client.storage
        .from(SUPABASE_IMAGE_BUCKET)
        .createSignedUrls(chunk, SUPABASE_SIGNED_URL_SECONDS);
      if (error) {
        throw error;
      }
      (data || []).forEach((item, index) => {
        if (item && item.signedUrl) {
          const path = item.path || chunk[index];
          signedUrls.set(path, item.signedUrl);
          state.signedImageUrls.set(path, { url: item.signedUrl, expiresAt: expiresAfter });
        }
      });
    }
    return signedUrls;
  }

  async function createSupabaseSignedUrl(client, path) {
    const { data, error } = await client.storage
      .from(SUPABASE_IMAGE_BUCKET)
      .createSignedUrl(path, SUPABASE_SIGNED_URL_SECONDS);
    if (error) {
      throw error;
    }
    state.signedImageUrls.set(path, {
      url: data.signedUrl,
      expiresAt: Date.now() + SUPABASE_SIGNED_URL_SECONDS * 1000
    });
    return data.signedUrl;
  }

  async function saveSupabaseNote(client, date, title, text) {
    const user = await getSupabaseUser(client);
    const entryDate = validDateKey(date);
    if (!entryDate) {
      throw new Error("Choose a valid date before saving.");
    }

    const updatedAt = new Date().toISOString();
    const { error } = await client.from("diary_notes").upsert(
      {
        user_id: user.id,
        date: entryDate,
        title,
        text,
        updated_at: updatedAt
      },
      { onConflict: "user_id,date" }
    );
    if (error) {
      throw error;
    }

    if (isActiveSupabaseUser(user.id)) {
      state.notes.set(entryDate, { date: entryDate, title, text, updatedAt });
      requestRenderAll();
    }
  }

  async function deleteSupabaseNote(client, date) {
    const user = await getSupabaseUser(client);
    const entryDate = validDateKey(date);
    if (!entryDate) {
      return;
    }

    const { error } = await client.from("diary_notes").delete().eq("user_id", user.id).eq("date", entryDate);
    if (error) {
      throw error;
    }
    if (isActiveSupabaseUser(user.id)) {
      state.notes.delete(entryDate);
      requestRenderAll();
    }
  }

  async function uploadSupabaseImages(client, date, files) {
    const user = await getSupabaseUser(client);
    const entryDate = validDateKey(date) || localDateKey();
    const additions = [];

    for (const file of files) {
      const prepared = await prepareDiaryImage(file);
      const id = createId();
      const contentType = prepared.contentType || imageContentType(file) || "image/jpeg";
      const storagePath = `${user.id}/${entryDate}/${id}-${safeFileName(file.name)}`;
      const imageBlob = dataUrlToBlob(prepared.url, contentType);
      const uploadedAt = new Date().toISOString();

      const { error: uploadError } = await client.storage.from(SUPABASE_IMAGE_BUCKET).upload(storagePath, imageBlob, {
        cacheControl: "3600",
        contentType,
        upsert: false
      });
      if (uploadError) {
        throw uploadError;
      }

      const row = {
        id,
        user_id: user.id,
        date: entryDate,
        storage_path: storagePath,
        name: file.name,
        size: prepared.size || imageBlob.size || file.size,
        original_size: file.size,
        content_type: contentType,
        width: prepared.width,
        height: prepared.height,
        uploaded_at: uploadedAt
      };
      const { error: insertError } = await client.from("diary_images").insert(row);
      if (insertError) {
        await client.storage.from(SUPABASE_IMAGE_BUCKET).remove([storagePath]).catch(() => {});
        throw insertError;
      }

      additions.push({
        id,
        date: entryDate,
        url: await createSupabaseSignedUrl(client, storagePath).catch(() => prepared.url),
        storagePath,
        name: file.name,
        size: row.size,
        originalSize: file.size,
        contentType,
        width: prepared.width,
        height: prepared.height,
        uploadedAt
      });
    }

    if (additions.length && isActiveSupabaseUser(user.id)) {
      state.images = [...additions, ...state.images].sort(sortImagesNewestFirst);
      renderAll();
    }
  }

  async function deleteSupabaseImage(client, image) {
    const user = await getSupabaseUser(client);
    if (image.storagePath) {
      const { error: removeError } = await client.storage.from(SUPABASE_IMAGE_BUCKET).remove([image.storagePath]);
      if (removeError && !isMissingSupabaseStorageObject(removeError)) {
        throw removeError;
      }
      state.signedImageUrls.delete(image.storagePath);
    }

    const { error } = await client.from("diary_images").delete().eq("user_id", user.id).eq("id", image.id);
    if (error) {
      throw error;
    }
    if (isActiveSupabaseUser(user.id)) {
      state.images = state.images.filter((item) => item.id !== image.id);
      renderAll();
    }
  }

  async function deleteAllSupabaseRecords(client) {
    const user = await getSupabaseUser(client);
    const paths = await listSupabaseImagePaths(client, user.id);
    for (const chunk of chunkArray(paths, 100)) {
      if (!chunk.length) {
        continue;
      }
      const { error } = await client.storage.from(SUPABASE_IMAGE_BUCKET).remove(chunk);
      if (error && !isMissingSupabaseStorageObject(error)) {
        throw error;
      }
    }

    const imagesDelete = await client.from("diary_images").delete().eq("user_id", user.id);
    if (imagesDelete.error) {
      throw imagesDelete.error;
    }
    const notesDelete = await client.from("diary_notes").delete().eq("user_id", user.id);
    if (notesDelete.error) {
      throw notesDelete.error;
    }
  }

  async function listSupabaseImagePaths(client, userId) {
    const paths = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await client
        .from("diary_images")
        .select("storage_path")
        .eq("user_id", userId)
        .range(from, from + pageSize - 1);
      if (error) {
        throw error;
      }
      paths.push(...(data || []).map((row) => row.storage_path).filter(Boolean));
      if (!data || data.length < pageSize) {
        return paths;
      }
      from += pageSize;
    }
  }

  function chunkArray(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks;
  }

  function isMissingSupabaseStorageObject(error) {
    return String((error && error.message) || "").toLowerCase().includes("not found");
  }

  async function setSelectedDate(date) {
    const nextDate = validDateKey(date);
    if (!nextDate) {
      return;
    }
    await flushAutoSave();
    state.selectedDate = nextDate;
    state.noteTitleDate = null;
    state.noteTextDate = null;
    els.noteDate.value = nextDate;
    els.historyMonth.value = nextDate.slice(0, 7);
    renderAll();
  }

  function openDatePicker() {
    openPicker(els.noteDate);
  }

  function openHistoryMonthPicker() {
    openPicker(els.historyMonth);
  }

  function openPicker(input) {
    input.focus();
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch (error) {
        // Some browsers only allow showPicker during a trusted click.
      }
    }
    input.click();
  }

  async function moveDate(delta) {
    await flushAutoSave();
    const date = new Date(`${state.selectedDate}T12:00:00`);
    date.setDate(date.getDate() + delta);
    await setSelectedDate(toDateKey(date));
  }

  function setView(view) {
    if (view !== "entry" && view !== "gallery") {
      return;
    }
    if (state.currentView === view && window.location.hash === `#${view}`) {
      return;
    }
    state.currentView = view;
    document.querySelectorAll("[data-view-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.viewTarget === view);
    });
    document.querySelectorAll(".view-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `${view}View`);
    });
    window.location.hash = view;
    renderAll();
  }

  function syncViewFromHash() {
    const view = window.location.hash.replace("#", "");
    if ((view === "entry" || view === "gallery") && state.currentView !== view) {
      setView(view);
      return true;
    }
    return false;
  }

  function renderAll() {
    if (!state.user) {
      return;
    }
    if (state.currentView === "gallery") {
      renderGallery();
    } else {
      const imageIndex = getImageIndexByDate();
      renderEditor();
      renderDailyPhotos(imageIndex);
      renderHistory(imageIndex);
    }

    if (els.exportDialog.hasAttribute("open")) {
      updateExportSummary();
    }
  }

  function requestRenderAll() {
    if (state.renderFrame) {
      return;
    }

    const scheduleFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 16));
    state.renderFrame = scheduleFrame(() => {
      state.renderFrame = null;
      renderAll();
    });
  }

  function renderEditor() {
    const note = state.notes.get(state.selectedDate);
    const noteTitle = note && note.title ? note.title : "";
    const noteText = note && note.text ? note.text : "";
    const titleDateChanged = state.noteTitleDate !== state.selectedDate;
    const textDateChanged = state.noteTextDate !== state.selectedDate;
    const canReplaceTitle = document.activeElement !== els.noteTitle || titleDateChanged;
    const canReplaceText = document.activeElement !== els.noteText || textDateChanged;

    if (canReplaceTitle) {
      els.noteTitle.value = noteTitle;
      state.noteTitleDate = state.selectedDate;
    }

    if (canReplaceText) {
      els.noteText.value = noteText;
      state.noteTextDate = state.selectedDate;
    }

    els.weekdayLabel.textContent = fullDateLabel(state.selectedDate);
  }

  function renderDailyPhotos(imageIndex = getImageIndexByDate()) {
    const photos = imageIndex.get(state.selectedDate) || [];
    if (!photos.length) {
      els.dailyPhotos.innerHTML = '<div class="empty-state">No pictures for this day.</div>';
      return;
    }

    els.dailyPhotos.innerHTML = photos
      .map(
        (photo) => `
          <div class="daily-photo">
            <button class="photo-open" type="button" data-image-id="${escapeAttribute(photo.id)}">
              <img src="${escapeAttribute(photo.url)}" alt="${escapeAttribute(photo.name || "Diary picture")}" loading="lazy" decoding="async" />
            </button>
          </div>
        `
      )
      .join("");

  }

  function renderHistory(imageIndex = getImageIndexByDate()) {
    const month = els.historyMonth.value || state.selectedDate.slice(0, 7);
    const imageCounts = getImageCountsByDate(imageIndex);
    const dates = getKnownDates(imageIndex)
      .filter((date) => date.startsWith(month))
      .sort((a, b) => b.localeCompare(a));

    if (!dates.length) {
      els.historyList.innerHTML = '<div class="empty-state">No saved days in this month.</div>';
      return;
    }

    els.historyList.innerHTML = dates
      .map((date) => {
        const note = state.notes.get(date);
        const count = imageCounts.get(date) || 0;
        const snippet = noteSummary(note);
        return `
          <button class="history-item ${date === state.selectedDate ? "active" : ""}" type="button" data-date="${date}">
            <span class="history-date">${shortDateLabel(date)}</span>
            <span class="history-snippet">${escapeHtml(snippet)}</span>
            <span class="history-count"><i data-lucide="image"></i>${count}</span>
          </button>
        `;
      })
      .join("");

    refreshIcons(els.historyList);
  }

  function renderGallery() {
    renderGalleryMonthOptions();
    const month = els.galleryMonth.value;
    const sortDirection = els.gallerySort.value === "asc" ? "asc" : "desc";
    const images = [...state.images]
      .filter((image) => image.url && (!month || imageEntryDateKey(image).startsWith(month)))
      .sort((a, b) => sortGalleryImagesByEntryDate(a, b, sortDirection));

    if (!images.length) {
      els.galleryGrid.innerHTML = `<div class="empty-state">${month ? "No pictures in this month." : "No pictures yet."}</div>`;
      return;
    }

    els.galleryGrid.innerHTML = images
      .map(
        (image) => `
          <div class="gallery-card">
            <button class="photo-open" type="button" data-image-id="${escapeAttribute(image.id)}">
              <img src="${escapeAttribute(image.url)}" alt="${escapeAttribute(image.name || "Diary picture")}" loading="lazy" decoding="async" />
              <span class="gallery-meta">
                <span>Entry ${escapeHtml(shortDateLabel(imageEntryDateKey(image)))}</span>
                <span>Uploaded ${escapeHtml(uploadLabel(image.uploadedAt, image.date))}</span>
              </span>
            </button>
          </div>
        `
      )
      .join("");

  }

  function renderGalleryMonthOptions() {
    const selected = els.galleryMonth.value;
    const months = Array.from(
      new Set(
        state.images
          .map((image) => imageEntryDateKey(image).slice(0, 7))
          .filter((month) => /^\d{4}-\d{2}$/.test(month))
      )
    ).sort((a, b) => b.localeCompare(a));
    const nextValue = selected && months.includes(selected) ? selected : "";
    const signature = months.join("|");

    if (state.galleryMonthSignature !== signature) {
      els.galleryMonth.innerHTML = [
        '<option value="">All dates</option>',
        ...months.map((month) => `<option value="${escapeAttribute(month)}">${escapeHtml(monthLabel(month))}</option>`)
      ].join("");
      state.galleryMonthSignature = signature;
    }
    els.galleryMonth.value = nextValue;
  }

  function openImageDialog(imageId) {
    const image = state.images.find((item) => item.id === imageId);
    if (!image) {
      return;
    }
    const entryDate = imageEntryDateKey(image);
    const note = state.notes.get(entryDate);
    els.dialogImage.src = image.url;
    els.dialogImage.alt = image.name || "Diary picture";
    els.dialogDate.textContent = fullDateLabel(entryDate);
    els.dialogNoteTitle.textContent = noteTitleForDisplay(note);
    els.dialogNoteText.textContent =
      note && note.text && note.text.trim() ? note.text.trim() : "No note saved for this day.";
    state.activeDialogImageId = image.id;

    if (typeof els.imageDialog.showModal === "function") {
      els.imageDialog.showModal();
    } else {
      els.imageDialog.setAttribute("open", "");
    }
  }

  function closeImageDialog() {
    state.activeDialogImageId = null;
    if (typeof els.imageDialog.close === "function") {
      els.imageDialog.close();
    } else {
      els.imageDialog.removeAttribute("open");
    }
    els.dialogImage.removeAttribute("src");
  }

  function getKnownDates(imageIndex = getImageIndexByDate()) {
    const dates = new Set();
    state.notes.forEach((note, date) => {
      const dateKey = validDateKey(date);
      if (dateKey && (noteHasContent(note) || imageIndex.has(dateKey))) {
        dates.add(dateKey);
      }
    });
    imageIndex.forEach((images, date) => {
      if (images.length) {
        dates.add(date);
      }
    });
    return Array.from(dates);
  }

  function getImageIndexByDate() {
    const imagesByDate = new Map();
    state.images.forEach((image) => {
      if (!image.url) {
        return;
      }
      const dateKey = imageEntryDateKey(image);
      if (!dateKey) {
        return;
      }
      if (!imagesByDate.has(dateKey)) {
        imagesByDate.set(dateKey, []);
      }
      imagesByDate.get(dateKey).push(image);
    });
    return imagesByDate;
  }

  function getImageCountsByDate(imageIndex = getImageIndexByDate()) {
    const counts = new Map();
    imageIndex.forEach((images, date) => {
      counts.set(date, images.length);
    });
    return counts;
  }

  function setSaveState(message) {
    els.saveState.textContent = message;
    if (message === "Saved") {
      window.setTimeout(() => {
        if (els.saveState.textContent === "Saved") {
          els.saveState.textContent = "Autosave ready";
        }
      }, 2200);
    }
  }

  function noteSummary(note) {
    if (!note) {
      return "Pictures only";
    }
    if (note.title && note.title.trim()) {
      return note.title.trim();
    }
    if (note.text && note.text.trim()) {
      return note.text.trim();
    }
    return "Pictures only";
  }

  function noteHasContent(note) {
    return Boolean(note && ((note.title && note.title.trim()) || (note.text && note.text.trim())));
  }

  function noteTitleForDisplay(note) {
    if (note && note.title && note.title.trim()) {
      return note.title.trim();
    }
    return "Note from this day";
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("show");
    }, 2600);
  }

  function localDateKey() {
    return toDateKey(new Date());
  }

  function toDateKey(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }
    const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return copy.toISOString().slice(0, 10);
  }

  function fullDateLabel(date) {
    const parsed = dateFromKey(date);
    if (!parsed) {
      return "Unknown date";
    }
    return DATE_FORMATTERS.full.format(parsed);
  }

  function shortDateLabel(date) {
    const parsed = dateFromKey(date);
    if (!parsed) {
      return "Unknown";
    }
    return DATE_FORMATTERS.short.format(parsed);
  }

  function validDateKey(date) {
    const value = String(date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return "";
    }

    const parsed = dateFromKey(value);
    return parsed ? value : "";
  }

  function dateFromKey(date) {
    const value = String(date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const parsed = new Date(`${value}T12:00:00`);
    if (Number.isNaN(parsed.getTime()) || toDateKey(parsed) !== value) {
      return null;
    }
    return parsed;
  }

  function imageEntryDateKey(image) {
    return validDateKey(image.date) || imageUploadDateKey(image);
  }

  function imageUploadDateKey(image) {
    const date = dateFromValue(image.uploadedAt);
    return date ? toDateKey(date) : validDateKey(image.date);
  }

  function uploadLabel(value, fallbackDate) {
    const date = dateFromValue(value);
    if (!date) {
      return fallbackDate ? shortDateLabel(fallbackDate) : "";
    }
    return DATE_FORMATTERS.short.format(date);
  }

  function monthLabel(monthKey) {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return "Unknown month";
    }
    const parsed = new Date(`${monthKey}-01T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return "Unknown month";
    }
    return DATE_FORMATTERS.month.format(parsed);
  }

  function getTimestamp(value) {
    const date = dateFromValue(value);
    return date ? date.getTime() : 0;
  }

  function dateFromValue(value) {
    if (!value) {
      return null;
    }

    try {
      const date =
        typeof value.toDate === "function"
          ? value.toDate()
          : new Date(timestampInputToMilliseconds(value));
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    } catch (error) {
      return null;
    }
  }

  function timestampInputToMilliseconds(value) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value.seconds === "number") {
      return value.seconds * 1000;
    }
    if (typeof value._seconds === "number") {
      return value._seconds * 1000;
    }
    return NaN;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function refreshIcons(root = document) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return;
    }

    root.querySelectorAll("i[data-lucide]").forEach((placeholder) => {
      const name = placeholder.getAttribute("data-lucide") || "";
      const template = document.createElement("template");
      template.innerHTML = iconSvg(name);
      placeholder.replaceWith(template.content.firstElementChild);
    });
  }

  function iconSvg(name) {
    const iconName = ICON_PATHS[name] ? name : "leaf";
    const className = iconName.replace(/[^a-z0-9_-]/gi, "");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-${escapeAttribute(
      className
    )}">${ICON_PATHS[iconName]}</svg>`;
  }
})();
