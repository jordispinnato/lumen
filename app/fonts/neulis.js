import localFont from "next/font/local";

export const neulis = localFont({
  src: [
    { path: "./neulis/Neulis-Thin.otf", weight: "100", style: "normal" },
    { path: "./neulis/Neulis-ThinItalic.otf", weight: "100", style: "italic" },
    { path: "./neulis/Neulis-ExtraLight.otf", weight: "200", style: "normal" },
    { path: "./neulis/Neulis-ExtraLightItalic.otf", weight: "200", style: "italic" },
    { path: "./neulis/Neulis-Light.otf", weight: "300", style: "normal" },
    { path: "./neulis/Neulis-LightItalic.otf", weight: "300", style: "italic" },
    { path: "./neulis/Neulis-Regular.otf", weight: "400", style: "normal" },
    { path: "./neulis/Neulis-Italic.otf", weight: "400", style: "italic" },
    { path: "./neulis/Neulis-Medium.otf", weight: "500", style: "normal" },
    { path: "./neulis/Neulis-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "./neulis/Neulis-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./neulis/Neulis-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "./neulis/Neulis-Bold.otf", weight: "700", style: "normal" },
    { path: "./neulis/Neulis-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "./neulis/Neulis-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "./neulis/Neulis-ExtraBoldItalic.otf", weight: "800", style: "italic" },
    { path: "./neulis/Neulis-Black.otf", weight: "900", style: "normal" },
    { path: "./neulis/Neulis-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-primary",
  display: "swap",
});
