# 🇨🇭 Doctor T's 60th Birthday: Swiss National Park Bike Tour Quiz

A celebratory, interactive web application created for Doctor T's 60th birthday. This app combines a virtual bike tour around the Swiss National Park with a humorous quiz based on Swiss and Australian "citizenship" facts.

## 🚵 The Journey
Doctor T's goal is to complete the **Nationalpark-Bike-Tour (Route 444)**, starting and ending in Scuol. The tour consists of 16 geographical stages through the beautiful Lower Engadin and Val Müstair.

### 🎮 Game Mechanics
- **Movement:** Doctor T's marker (featuring his photo!) only moves forward when a question is answered correctly.
- **The Penalty:** If Doctor T gets **two Swiss questions wrong in a row**, he is sent back one location on the map (but never further than the start!).
- **Aussie Bonus:** Every 4th question is a "funny" Australian citizenship question. Answering these correctly grants a **+2 location bonus jump** with no penalty for wrong answers.
- **Dynamic Visuals:** As Doctor T moves, the sidebar displays a beautiful, high-resolution landscape photo of his current geographical location.
- **The Prank Finish:** After reaching the final goal, Doctor T must face one last "impossible" question about his tour date that might just send him all the way back to the start for a victory lap!

## 🔊 Sound Effects
- **Swiss Correct:** Iconic "Oh Yeah" by the Swiss duo **Yello**.
- **Swiss Incorrect:** The legendary **Swiss PostBus Three-Tone Horn**.
- **Australian Bonus:** Custom sounds for "Good Boy" and "Sorry Mate".

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (Swiss national theme)
- **Maps:** Leaflet.js with OpenStreetMap
- **Deployment:** GitHub Pages via GitHub Actions (Node.js 24 optimized)

## 🚀 How to Play
The game is hosted live at: **[https://dougxc.github.io/switizenship-test/](https://dougxc.github.io/switizenship-test/)**

### Local Development
If you want to run the project locally:
1. Clone the repo
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Or use the macOS launcher: Double-click `Start_Doctor_T_Quiz.command`

---
*Created with ❤️ for Doctor T's 60th Birthday.*
