# Merge Conflicts - Quick Start Guide for Complete Beginners

## What You See in VS Code

When you have a merge conflict, you'll see something like this in your file:

```
<<<<<<< HEAD
Your code here
=======
Their code here
>>>>>>> branch-name
```

## What Those Buttons Mean

VS Code shows you **3 buttons** above the conflict:

### 1️⃣ "Accept Current Change"
```
✅ Keeps: Your code
❌ Deletes: Their code
```
**When to use:** Your code is correct

### 2️⃣ "Accept Incoming Change"
```
❌ Deletes: Your code
✅ Keeps: Their code
```
**When to use:** Their code is the better version

### 3️⃣ "Accept Both Changes"
```
✅ Keeps: Your code
✅ Keeps: Their code
```
**When to use:** You need both pieces (rare!)

## Simple Decision Tree

```
START HERE
    ↓
Is your code better? 
    ↓ YES                        ↓ NO
Accept Current          Is their code better?
    Change                  ↓ YES              ↓ NO
                    Accept Incoming      Do you need both?
                        Change          ↓ YES        ↓ NO
                                  Accept Both    Manually
                                    Changes         edit
```

## Real Example

**Your README has this conflict:**

```
<<<<<<< HEAD
# Personal Profile Website
A personal website with Notion integration.
=======
# wenhengfei-space
This is where I share my work and thoughts.
>>>>>>> main
```

**What to do:**
1. Read both versions
2. Decide which title and description you prefer
3. Click the button for your choice
4. Save the file
5. Commit the changes

**Pro tip:** If you like parts of both, click "Accept Current Change" first, then manually add the parts you want from the other version.

## After You Click a Button

✅ **Good signs:**
- No more `<<<<<<<`, `=======`, or `>>>>>>>` markers
- Code makes sense
- File is saved

❌ **Bad signs:**
- Still see conflict markers
- Code looks broken
- File won't save

## Quick Checklist

Before you commit:
- [ ] Read both versions
- [ ] Clicked one of the three buttons
- [ ] No more conflict markers in file
- [ ] Saved the file
- [ ] Code still makes sense

## Still Confused?

👉 Read the full guide: [PULL_REQUEST_GUIDE.md](../PULL_REQUEST_GUIDE.md)

👉 Ask for help if:
- You don't understand what the code does
- Both versions look the same to you
- You're afraid of breaking something

## Remember

🎯 **Key Point:** The three buttons just help you choose which version to keep. That's it!

🎯 **Don't Panic:** You can't permanently break anything. Git keeps all history.

🎯 **When in Doubt:** Take a screenshot and ask someone for help.

---

**You got this! 💪**
