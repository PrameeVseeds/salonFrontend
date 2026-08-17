import axios from "axios";
import { Image, Palette, Save, Trash2, Upload, Video } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {deleteHeroMedia,getThemeSettings,updateHeroMedia,updateThemeSettings,} from "../../services/themeSettingsService";
import type { HeroMediaType, ThemeSettings } from "../../types/themeSettings";
import "./themeSettingsPage.css";

const errorMessage = (e: unknown) =>
  axios.isAxiosError<{ message?: string }>(e)
    ? (e.response?.data?.message ?? "Request failed.")
    : "Request failed.";
const ThemeSettingsPage = () => {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [primary, setPrimary] = useState("#7A2E8E");
  const [secondary, setSecondary] = useState("#C23BAA");
  const [accent, setAccent] = useState("#D4AF37");
  const [mediaType, setMediaType] = useState<HeroMediaType>("Image");
  const [file, setFile] = useState<File | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    const applySettings = (value: ThemeSettings) => {
      setSettings(value);
      setPrimary(value.primaryColor);
      setSecondary(value.secondaryColor);
      setAccent(value.accentColor);
      setMediaType(value.heroMediaType);
    };
    getThemeSettings()
      .then(({ data }) => applySettings(data.themeSettings))
      .catch(async (e: unknown) => {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          try {
            const { data } = await updateThemeSettings({
              primaryColor: "#7A2E8E",
              secondaryColor: "#C23BAA",
              accentColor: "#D4AF37",
              heroMediaType: "Image",
            });
            applySettings(data.themeSettings);
          } catch (initializationError) {
            setError(errorMessage(initializationError));
          }
          return;
        }
        setError(errorMessage(e));
      });
  }, []);
  useEffect(
    () => () => {
      if (selectedMediaUrl) URL.revokeObjectURL(selectedMediaUrl);
    },
    [selectedMediaUrl],
  );

  const selectFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setSelectedMediaUrl(null);
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setFile(null);
      setSelectedMediaUrl(null);
      setError("Hero media must be 25 MB or smaller.");
      return;
    }
    const isValidType =
      mediaType === "Image"
        ? ["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)
        : ["video/mp4", "video/webm"].includes(selectedFile.type);
    if (!isValidType) {
      setFile(null);
      setSelectedMediaUrl(null);
      setError(`Choose a supported ${mediaType.toLowerCase()} file.`);
      return;
    }
    setFile(selectedFile);
    setSelectedMediaUrl(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const selectMediaType = (type: HeroMediaType) => {
    setMediaType(type);
    setFile(null);
    setSelectedMediaUrl(null);
    setError(null);
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await updateThemeSettings({
        primaryColor: primary,
        secondaryColor: secondary,
        accentColor: accent,
        heroMediaType: mediaType,
      });
      setSettings(data.themeSettings);
      setSuccess("Theme colors updated successfully.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const upload = async () => {
    if (!file) {
      setError("Choose a hero media file first.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await updateHeroMedia(file, mediaType);
      setSettings(data.themeSettings);
      setFile(null);
      setSelectedMediaUrl(null);
      setSuccess("Hero media updated successfully.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const removeMedia = async () => {
    if (selectedMediaUrl) {
      setFile(null);
      setSelectedMediaUrl(null);
      setError(null);
      return;
    }
    if (!settings?.heroMediaUrl) return;
    if (!window.confirm("Remove the current hero image or video?")) return;

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await deleteHeroMedia();
      setSettings(data.themeSettings);
      setSuccess("Hero media removed successfully.");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="theme-page">
      <header>
        <p className="dashboard-eyebrow">Website appearance</p>
        <h1>Theme settings</h1>
        <p>Control the public website palette and hero media.</p>
      </header>
      {error && <p className="theme-message is-error">{error}</p>}
      {success && <p className="theme-message is-success">{success}</p>}
      <div className="theme-layout">
        <form className="theme-card" onSubmit={(e) => void save(e)}>
          <div className="theme-card__title">
            <Palette />
            <div>
              <h2>Brand colors</h2>
              <p>Use six-digit hexadecimal colors.</p>
            </div>
          </div>
          {[
            ["Primary color", primary, setPrimary],
            ["Secondary color", secondary, setSecondary],
            ["Accent color", accent, setAccent],
          ].map(([label, value, setter]) => (
            <label className="color-field" key={label as string}>
              <span>{label as string}</span>
              <div>
                <input
                  type="color"
                  value={value as string}
                  onChange={(e) =>
                    (setter as (v: string) => void)(e.target.value)
                  }
                />
                <input
                  value={value as string}
                  pattern="#[0-9A-Fa-f]{6}"
                  onChange={(e) =>
                    (setter as (v: string) => void)(e.target.value)
                  }
                />
              </div>
            </label>
          ))}
          <button className="theme-primary-button" disabled={busy}>
            <Save />
            {busy ? "Saving..." : "Save colors"}
          </button>
        </form>
        <section className="theme-card">
          <div className="theme-card__title">
            <Upload />
            <div>
              <h2>Hero media</h2>
              <p>Images or videos up to 25 MB.</p>
            </div>
          </div>
          <div className="media-types">
            <button
              className={mediaType === "Image" ? "is-selected" : ""}
              type="button"
              onClick={() => selectMediaType("Image")}
            >
              <Image />
              Image
            </button>
            <button
              className={mediaType === "Video" ? "is-selected" : ""}
              type="button"
              onClick={() => selectMediaType("Video")}
            >
              <Video />
              Video
            </button>
          </div>
          {(selectedMediaUrl || settings?.heroMediaUrl) && (
            <div className={`hero-preview${selectedMediaUrl ? " is-selected" : ""}`}>
              {selectedMediaUrl && <span>New preview</span>}
              {(selectedMediaUrl ? mediaType : settings?.heroMediaType) === "Image" ? (
                <img
                  src={selectedMediaUrl ?? settings?.heroMediaUrl ?? ""}
                  alt={selectedMediaUrl ? "Selected hero preview" : "Current hero"}
                />
              ) : (
                <video src={selectedMediaUrl ?? settings?.heroMediaUrl ?? ""} controls />
              )}
            </div>
          )}
          <label className="media-file">
            <input
              type="file"
              accept={
                mediaType === "Image"
                  ? "image/jpeg,image/png,image/webp"
                  : "video/mp4,video/webm"
              }
              onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
            />
            <span>
              {file ? file.name : `Choose ${mediaType.toLowerCase()}`}
            </span>
          </label>
          <button
            type="button"
            className="theme-primary-button"
            onClick={() => void upload()}
            disabled={busy}
          >
            <Upload />
            {busy ? "Uploading..." : "Upload hero media"}
          </button>
          {(selectedMediaUrl || settings?.heroMediaUrl) && (
            <button
              type="button"
              className="theme-remove-button"
              onClick={() => void removeMedia()}
              disabled={busy}
            >
              <Trash2 />
              {selectedMediaUrl ? "Clear selected media" : "Remove current media"}
            </button>
          )}
        </section>
      </div>
    </div>
  );
};
export default ThemeSettingsPage;
