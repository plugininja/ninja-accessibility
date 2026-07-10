=== Ninja Accessibility ===
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

Ninja Accessibility is a powerful, lightweight WordPress plugin that adds a customizable accessibility toolbar to your website. It helps visitors with disabilities adjust how your site looks and behaves — larger text, higher contrast, readable fonts, a screen reader, a custom cursor, and more — so they can browse comfortably.

After activating the plugin, go to **Accessibility** in the WordPress admin sidebar. From there you can enable or disable each tool, customise the widget icon, colours, and position, and configure the custom mouse cursor. The widget then appears on your site frontend, where visitors open it to apply the adjustments they need. All changes are applied only in the visitor's own browser and never modify your site content.

**Core Features (Free)**

* **Bigger Text** — Increase font size for easier reading.
* **Bigger Line Height** — Increase spacing between lines.
* **Text Alignment** — Switch to left-aligned text.
* **Readable Font** — Switch to a clean, easy-to-read sans-serif font.
* **Text Magnifier** — Magnify text on hover.
* **Highlight Links** — Make links more visible.
* **Cursor** — Larger, high-contrast cursor.
* **Page Structure** — Show headings and landmarks.
* **Screen Reader** — Text-to-speech support.
* **Reading Mask** — Focus on one line at a time.
* **Sitemap** — Quick site navigation.
* **Hide Images** — Remove visual distractions.
* **Pause Animations** — Stop CSS/GIF animations.
* **Mute Sounds** — Suppress autoplay audio.
* **Reading Line** — Horizontal guide line.
* **Greyscale** — Reduce colour saturation.
* **Contrast** — High-contrast colour mode.
* **Invert Colours** — Invert all page colours.
* **Brightness** — Adjust page brightness.
* **Saturation** — Adjust colour saturation.
* **Outline Focus** — High-visibility outline on the focused element for keyboard users.
* **Skip to Main Content** — Skip-navigation link for keyboard users.

**Widget Customization**

* Choose widget icon and background colour.
* Set corner radius.
* Control visibility per device (desktop / tablet / phone).
* Choose position (bottom-right, bottom-left, top-right, top-left, etc.).
* Set exact pixel position per device.
* Custom mouse cursor with size and effect options.

== Installation ==

1. Upload the `ninja-accessibility` folder to the `/wp-content/plugins/` directory, or install directly via the WordPress admin → Plugins → Add New.
2. Activate the plugin through the **Plugins** screen.
3. Go to **Accessibility** in the WordPress admin sidebar to configure your widget.

== Frequently Asked Questions ==

= Does this plugin make my site WCAG 2.1 compliant? =

The widget provides tools to help users improve their own experience, which contributes to practical accessibility. Full WCAG compliance requires a comprehensive site audit beyond any single plugin.

= Does it slow down my site? =

The plugin is designed to be lightweight. Scripts are loaded in the footer, only when the widget or custom cursor is enabled, and the PHP footprint is minimal.

= Does the widget add any links to my site? =

No. The widget does not display any external links or credits by default. An optional "Powered by" attribution can be enabled by the site administrator under **Accessibility → Settings → General**, and it stays off unless you turn it on.

= Can I customise which features show in the widget? =

Yes — go to **Accessibility → Settings → Capabilities** to enable or disable individual tools.

== Source Code and Contributing ==

Ninja Accessibility is an open-source project. The compiled JavaScript and CSS shipped with the plugin are built from the human-readable sources in the `source/` directory. You can view the full sources and contribute on GitHub: https://github.com/plugininja/ninja-accessibility

== Third-Party Assets ==

The plugin bundles the following assets, served locally (no external requests):

* **Poppins** font — SIL Open Font License 1.1 (https://fonts.google.com/specimen/Poppins/license)
* **Material Symbols** icon font — Apache License 2.0 (https://github.com/google/material-design-icons/blob/master/LICENSE)

== Screenshots ==

1. Frontend accessibility widget
2. Admin settings panel
3. Capability toggles

== Changelog ==

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
