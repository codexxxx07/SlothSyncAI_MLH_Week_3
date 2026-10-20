# SlothSync AI — You Relax. SlothSync Handles the Mess.

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

## What I Built

**SlothSync AI** is a local-first, AI-powered file organization application designed to make managing messy folders effortless.

We all have a Downloads folder filled with screenshots, documents, PDFs, images, and files we keep postponing organizing. Manually sorting them into folders, renaming files, and identifying duplicates takes time and effort.

SlothSync AI aims to automate this repetitive work.

Users can select a folder, scan its contents, and use AI-powered suggestions to classify files, recommend meaningful filenames, and create an organization plan. Before any changes are made, users can review the proposed operations and decide what to approve.

Key features include:

* **AI-Powered File Classification:** Categorize files into meaningful groups.
* **Smart Filename Suggestions:** Generate clearer, more descriptive filenames.
* **Organization Preview:** Review proposed file moves and renames before approving them.
* **Duplicate Detection:** Identify duplicate files to help reduce clutter.
* **Operation History:** Review previous organization activities and undo supported operations.
* **Local AI Integration:** Use Ollama with a locally running model for AI-powered suggestions.
* **Privacy-Focused Workflow:** Keep file organization under the user's control, with explicit approval before changes are applied.

The goal is simple: spend less time managing files and more time doing things that actually matter.

## Demo

**Live Demo:** To be added if a suitable demo is available.

**Video Demo:** To be added.

SlothSync AI is designed as a desktop application because organizing files requires access to the user's local filesystem. A browser-only interface would not provide the same direct filesystem workflow.

## Code

**GitHub Repository:** Add the SlothSync AI repository URL here.

The project is being developed with a focus on local-first functionality, practical automation, and a user-friendly desktop experience.

## How I Built It

SlothSync AI is designed around a desktop interface, local file operations, and open-source AI.

### Technology Stack

* **React** — Building the user interface.
* **Vite** — Frontend development and build tooling.
* **Tailwind CSS** — Styling the interface.
* **Tauri** — Desktop application integration and access to native capabilities.
* **Ollama** — Running supported AI models locally.
* **Local Storage / SQLite, where implemented** — Persisting application preferences and relevant operation history.

### How AI Fits Into the Application

Instead of relying entirely on a hosted AI API, SlothSync AI can use a locally running model through Ollama to generate file classification and organization suggestions.

The intended workflow is:

1. The user selects a folder.
2. The application scans the folder and gathers relevant file metadata.
3. The local AI model helps generate organization suggestions.
4. The application presents the proposed changes for review.
5. The user approves the operations before the application applies them.

The AI assists with decisions, while the application handles file operations through controlled logic.

This separation is important: AI-generated suggestions should never automatically trigger potentially destructive filesystem changes.

*Note: Ollama and a compatible model must be installed and configured separately. AI functionality depends on the actual local model and application configuration.*

## Why Does Open Innovation Matter?

Open innovation is central to the idea behind SlothSync AI.

File organization is a personal, everyday task. It should not require users to send their file information to a third-party AI service simply to organize their own computers.

By supporting open-weight models through local inference, SlothSync AI offers an alternative to applications that depend entirely on closed, hosted AI APIs.

### 1. Greater Control Over Personal Data

Files can contain personal documents, academic work, business information, screenshots, and other sensitive material.

A local-first approach makes it possible to generate AI suggestions without automatically sending file metadata to an external AI provider, provided the application is configured to use local inference and does not transmit that information through another service.

Users retain greater control over their files and how AI processes the information provided to it.

### 2. Less Dependence on Internet Connectivity

When a compatible model is already installed and running locally, AI inference can work without an internet connection.

That means the core AI-powered organization workflow can be designed to operate offline, provided the required model, application resources, and other dependencies are available locally.

This is particularly useful for people with unreliable internet connections or those who prefer working offline.

### 3. Fewer Recurring AI API Costs

Hosted AI APIs may charge users according to usage, request volume, or subscription plans.

With local inference, users can run a compatible model on their own hardware without paying a per-request fee to a hosted AI provider.

There can still be costs associated with hardware, electricity, storage, and other services. However, local inference offers the possibility of avoiding recurring hosted-AI usage charges.

### 4. Freedom to Experiment and Customize

Open-weight models allow developers to explore different models and configurations rather than being restricted to a single provider's API.

Different models can be evaluated for classification quality, speed, hardware requirements, and resource usage.

This flexibility is valuable for a project like SlothSync AI because file organization needs to balance useful suggestions with reasonable performance on everyday computers.

### 5. Automation That Respects the User

Open innovation is not only about choosing a model. It is also about building tools that give users more control.

SlothSync AI follows a human-in-the-loop approach: the model suggests, the application prepares a plan, and the user decides what happens to their files.

The objective is to combine the flexibility of open AI with a safer, more transparent user experience.

**For this project, open innovation makes local, customizable, and potentially offline AI-assisted file organization possible without making a closed AI API the foundation of the application.**

## My Agent Session

Optional: Add a DevRelay agent session link or embed it here if a session is recorded and available.

## The Lazy Payoff

The biggest benefit of SlothSync AI is reducing the mental effort involved in keeping files organized.

Instead of repeatedly opening files, deciding where they belong, inventing filenames, and checking for duplicates, users can review a collection of suggested actions in one place.

The intended payoff includes:

* Less manual sorting.
* Less time spent renaming files.
* Easier identification of duplicates.
* A more organized Downloads folder.
* More time for studying, coding, building projects, or simply relaxing.

I am building SlothSync AI around a simple principle: repetitive digital housekeeping should not require more effort than necessary.

The application is designed to make these tasks easier while keeping users in control of the final changes.

## Prize Categories

Select the applicable partner categories according to the challenge's official rules and the technologies actually used in the project.

## Closing Thoughts

SlothSync AI explores how open-source AI can make everyday automation more private, flexible, and accessible.

Rather than building another application that sends every request to a hosted AI service, the project explores an alternative: let users run AI locally, review its suggestions, and automate repetitive tasks on their own machines.

Because sometimes the most useful automation is the kind that quietly handles the boring work while you get on with your day.

**You relax. SlothSync handles the mess.**
