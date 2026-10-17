# CONTENT_REQUESTS.md: What to ask members, founders and officers for

Send these to the people involved. Each section matches a file in `content/`, so answers can be copied straight in. A Google Form with these exact questions works well.

---

## 1. Member stories → `content/members.json`

### Message to members (ready to send)

> Hi! We're building the new Talk-Masters Club website and would love to feature your story: how you found Toastmasters and what's changed since. It takes about 10 minutes. Everything is optional except your name and story, and nothing is published until you've approved it. You can ask us to remove it at any time.

### Questions

| #   | Question                                                                                                                               | Required            | Goes into      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------- |
| 1   | Your name, as you'd like it shown                                                                                                      | Yes                 | `name`         |
| 2   | Your club role, if any (e.g. VP Education, or "Member")                                                                                | Yes                 | `role`         |
| 3   | Your job title                                                                                                                         | Optional            | `occupation`   |
| 4   | Where you work or study                                                                                                                | Optional            | `organisation` |
| 5   | The year you joined Talk-Masters                                                                                                       | Yes                 | `memberSince`  |
| 6   | Before Toastmasters, what was speaking like for you? (one sentence)                                                                    | Yes                 | `before`       |
| 7   | And today? (one sentence)                                                                                                              | Yes                 | `today`        |
| 8   | Your story: why you came to your first meeting, a moment things changed, and how it shows up in your work or life now. (100-300 words) | Yes                 | `story`        |
| 9   | One line you'd like quoted on your card                                                                                                | Yes                 | `quote`        |
| 10  | A photo of yourself (see photo guide below)                                                                                            | Strongly encouraged | image slot     |
| 11  | Consent (see below)                                                                                                                    | **Yes**             | `consent`      |

### Consent wording (copy exactly, one tick box each)

- ☐ I agree that Talk-Masters Club may publish my **name, story and quote** on its website.
- ☐ I agree that my **photo** may be published with my story.
- ☐ I agree that my **job title and workplace** may be published. _(Leave unticked to keep them private.)_
- ☐ I understand I can ask for any of this to be changed or removed at any time by emailing the club.

Record the date and keep the form response. That's the "written permission" the site's rules require. Only set `"consent": true` when the first box is ticked, and leave out `occupation` and `organisation` if the third isn't.

---

## 2. Founders → `content/founders.json` and `content/history.json`

### Questions for each founder

1. Name, and your role when the club began (e.g. Founding President)
2. What do you do now? (optional)
3. Why did you want to start a Toastmasters club? What was missing?
4. What do you remember about the first meeting? Where was it, and how many came?
5. A moment from the early days you're proud of
6. One line you'd like quoted
7. A portrait photo, plus any **early club photos** you have
8. The same consent boxes as members

### Club facts (from the officers or the Toastmasters club dashboard)

- Year founded, and the charter date if known
- Club number and district (shown on the charter certificate)

---

## 3. Awards → `content/awards.json`

For each award, send:

| Field                                      | Example                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Award name                                 | President's Distinguished Club                                                                                   |
| Programme                                  | Distinguished Club Program, Smedley Award, Talk Up Toastmasters, Beat the Clock, speech contest, education award |
| Level                                      | Club, Area, Division, District, Region, International                                                            |
| Toastmasters year (July to June)           | 2024-2025                                                                                                        |
| Who won it                                 | The club, or the member's name (with their consent)                                                              |
| One sentence on what it means              | "For meeting all 10 club goals in education, membership and training."                                           |
| Photo or scan of the certificate or trophy | Optional, very welcome                                                                                           |

Note: "Smedley" is the award named after Ralph Smedley, the founder of Toastmasters. Clubs earn it by adding new members in August and September. The **Smedley Distinguished** level of the Distinguished Club Program is a different recognition; list it as its own award.

---

## 4. Photo guide (for everyone)

- **Recent and clear**, face in focus, natural light, no heavy filters
- **Portrait orientation** (taller than wide), at least 1500px on the long side
- Plain or softly blurred background works best
- A phone photo is fine; please don't send screenshots or WhatsApp-compressed images (send as a document/file)
- File name: your name, e.g. `aisha-rahman.jpg`

How photos go on the site: [IMAGES.md](IMAGES.md).

---

## Checklist before anything goes live

- [ ] Consent recorded for every person named, quoted or pictured
- [ ] Workplace shown only for people who ticked that box
- [ ] Award years and levels checked against the Toastmasters records
- [ ] `npm run check:content -- --strict` passes (no placeholders left)
