=== Ninja Accessibility & Custom Cursor ===
Contributors: plugininja, abdullaharham
Tags: accessibility, wcag, ada, toolbar, widget
Requires at least: 6.2
Tested up to: 7.0
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add a configurable accessibility widget that helps visitors with disabilities improve readability, visual comfort, and navigation.

== Description ==

<a href="https://plugininja.com/ninja-accessibility/">Official Website</a> | <a href="https://plugininja.com/docs-category/ninja-accessibility/">Documentation</a> | <a href="https://www.youtube.com/@plugininja" target="_blank">Video Tutorials</a> | <a href="https://plugininja.com/support-portal/" target="_blank">Support</a>

Ninja Accessibility is a powerful, lightweight WordPress plugin that adds a customizable accessibility toolbar to your website. It helps visitors with disabilities adjust how your site looks and behaves — larger text, higher contrast, readable fonts, one-click accessibility profiles, a bigger cursor, and more — so they can browse comfortably.

After activating the plugin, go to **Accessibility** in the WordPress admin sidebar. From there you can enable or disable each tool under **Capabilities**, turn on one-click **Accessibility Profiles**, customise the widget icon, colours, size, and position, and configure the cursor. The widget then appears on your site frontend, where visitors open it to apply the adjustments they need. All changes are applied only in the visitor's own browser and never modify your site content.

**Accessibility Tools (Free)**

* **Content Scaling** — Zoom the whole page from 110% up to 140%.
* **Text Size** — Increase font size for easier reading.
* **Line Height** — Increase the spacing between lines.
* **Letter Spacing** — Increase the spacing between characters.
* **Text Align** — Left-, right-, or centre-align text.
* **Readable Font** — Switch to a clean, easy-to-read sans-serif font.
* **Highlight Links** — Make links easier to spot on the page.
* **Bigger Cursor** — Enlarge the mouse cursor (up to 4×) for better visibility.
* **Custom Cursor Shapes** — Replace the default pointer with one of 10 built-in cursor designs (circle variants, dot, ring, arrow styles). (Free via Mouse Customization)
* **Custom Cursor Colour** — Set cursor to any hex colour. (Free via Mouse Customization)
* **Custom Cursor Size** — Adjust cursor size from 8 px to 128 px. (Free via Mouse Customization)
* **Animated Ring Cursor** — Built-in circle shapes feature a smooth animated ring+dot pair that tracks your pointer and wraps around links on hover. (Free via Mouse Customization)
* **Hide Images** — Remove images to cut visual distractions.
* **Pause Animations** — Stop CSS and GIF animations.
* **Reading Line** — A horizontal guide line that follows the pointer.
* **Brightness** — Adjust page brightness (low / bright / dark).
* **Outline Focus** — High-visibility outline on the focused element for keyboard users.
* **Skip to Main Content** — Skip-navigation link for keyboard users.

**Accessibility Tools (Premium)**

These additional tools are available in [Ninja Accessibility Pro](https://plugininja.com/ninja-accessibility/).

* **Text Magnifier** — Magnify text on hover.
* **Page Structure** — List headings and landmarks for quick navigation.
* **Screen Reader** — Built-in text-to-speech.
* **Reading Mask** — Dim the page except one focused line.
* **Sitemap** — Quick links to the pages on your site.
* **Mute Sounds** — Suppress autoplay audio.
* **Greyscale** — Remove colour from the page.
* **Contrast** — High-contrast colour modes.
* **Invert Colours** — Invert all page colours.
* **Saturation** — Adjust colour saturation.

**One-Click Accessibility Profiles**

Preset bundles that switch on the right combination of tools for a specific need:

* **Motor Impaired** — Simplifies navigation and reduces movement. (Free)
* **Dyslexia** — Enhances readability and text clarity. (Free)
* **Low Vision** — Enlarges content and improves visibility. (Free)
* **Cognitive & Learning** — Reduces distractions to aid focus. (Free)
* **Blind**, **Color Blind**, **Seizure & Epileptic**, and **ADHD Friendly** — Available in Ninja Accessibility Pro.

**Widget Customization (Free)**

* Choose a built-in widget icon and set its background colour.
* Set the widget corner radius, and switch between standard and oversized sizes.
* Show or hide the widget per device (desktop / tablet / phone).
* Position the widget in any page corner (bottom-right, bottom-left, top-right, top-left).
* Optional "Powered by" attribution link — off by default; you decide whether to show it.

**Premium Customization & Insights**

* Upload a custom widget icon and set exact per-device (tablet / phone) positioning.
* Accessibility analytics dashboard — see which tools your visitors use most.

**Premium Cursor Effects**

Add motion and personality to your site cursor with these premium effects:

* **Custom Cursor Image Upload** — Upload your own cursor icon instead of using built-in shapes.
* **Per-Page Targeting** — Apply the custom cursor to individual pages instead of the entire site.
* **Emoji Cursor** — Replace the cursor with any emoji of your choice.
* **Springy Emoji** — An emoji that follows the pointer with spring physics for a playful feel.
* **Fairy Dust** — Colourful particles scatter behind the cursor in your chosen colours.
* **Bubbles** — Floating bubble particles trail the pointer.
* **Snowflakes** — ❄ particles drift downward from the cursor.
* **Ghost** — 👻 emoji particles spawn on mouse movement.
* **Trailing Cursor** — A smooth colour trail follows the pointer.
* **Rainbow Cursor** — A multi-coloured trail cycles through the spectrum.

Unlock all Premium tools and effects with [Ninja Accessibility Pro](https://plugininja.com/ninja-accessibility/).

== Installation ==

1. Upload the `ninja-accessibility` folder to the `/wp-content/plugins/` directory, or install directly via the WordPress admin → Plugins → Add New.
2. Activate the plugin through the **Plugins** screen.
3. Go to **Accessibility** in the WordPress admin sidebar to configure your widget.

== Frequently Asked Questions ==

= Does this plugin make my site WCAG 2.1 compliant? =

The widget provides tools to help users improve their own experience, which contributes to practical accessibility. Full WCAG compliance requires a comprehensive site audit beyond any single plugin.

= Which features are free, and which need Premium? =

The free plugin includes content scaling, text size, line height, letter spacing, text alignment, readable font, highlight links, bigger cursor, custom cursor shapes/colour/size/animated ring, hide images, pause animations, reading line, brightness, outline focus, skip-to-content, and four accessibility profiles (Motor Impaired, Dyslexia, Low Vision, Cognitive & Learning), plus widget customisation. [Ninja Accessibility Pro](https://plugininja.com/ninja-accessibility/) adds the text magnifier, page structure, screen reader, reading mask, sitemap, mute sounds, greyscale, contrast, invert colours and saturation tools, four more profiles (Blind, Color Blind, Seizure & Epileptic, ADHD Friendly), custom icon uploads, per-device positioning, premium cursor effects (custom cursor image upload, per-page targeting, emoji cursor, springy emoji, fairy dust, bubbles, snowflakes, ghost, trailing cursor, rainbow cursor), and an analytics dashboard.

= What are accessibility profiles? =

Profiles are one-click presets. Instead of toggling individual tools, a visitor can pick a profile such as "Dyslexia" or "Low Vision" and the widget turns on the combination of tools best suited to that need. You can enable or disable profiles under **Accessibility → Capabilities**.

= Does it slow down my site? =

The plugin is designed to be lightweight. Scripts are loaded in the footer, only when the widget or custom cursor is enabled, and the PHP footprint is minimal.

= Does the widget add any links to my site? =

No. The widget does not display any external links or credits by default. An optional "Powered by" attribution can be enabled by the site administrator under **Accessibility → Settings → General**, and it stays off unless you turn it on.

= Can I customise which features show in the widget? =

Yes — go to **Accessibility → Settings → Capabilities** to enable or disable individual tools and profiles.

== Source Code and Contributing ==

Ninja Accessibility is an open-source project. The compiled JavaScript and CSS shipped with the plugin are built from the human-readable sources in the `source/` directory. You can view the full sources and contribute on GitHub: https://github.com/plugininja/ninja-accessibility

== Third-Party Assets ==

The plugin bundles the following assets, served locally (no external requests):

* **Poppins** font — SIL Open Font License 1.1 (https://fonts.google.com/specimen/Poppins/license)
* **Material Symbols** icon font — Apache License 2.0 (https://github.com/google/material-design-icons/blob/master/LICENSE)

== External Services ==

This plugin relies on Freemius to handle plugin licensing, version checks, and software updates, and — only if you opt in — anonymous usage diagnostics that help us improve the plugin.

On activation the plugin shows an opt-in screen. Only if you choose "Allow & Continue" does it send basic environment data (your site URL, admin email address, and your WordPress, PHP, active theme and plugin version details) to Freemius. You may skip this and the plugin stays fully functional. When you purchase or activate a premium license, license validation and update requests are sent to Freemius as part of delivering those updates. No data is sent for anonymous visitors browsing your site.

This service is provided by Freemius, Inc. Terms of Service: https://freemius.com/terms/ — Privacy Policy: https://freemius.com/privacy/

== Screenshots ==

1. Frontend accessibility widget
2. Admin settings panel
3. Capability toggles
4. One-click accessibility profiles

== Changelog ==

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
