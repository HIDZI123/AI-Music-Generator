# AI Music Generator

This project is a full-stack application that allows users to generate music using AI. It features a Next.js frontend for user interaction and a Python backend to handle the AI music generation process.

## 🖼️ Screenshots

(Add screenshots of the application here to give a visual overview of the project.)

- **Home Page:**
  ![Home Page](./screenshots/Screenshot%202025-09-13%20130552.png)
- **Music Generation Page:**
  ![Music Generation Page](./screenshots/Screenshot%202025-09-13%20130620.png)
  ![Music Generation Page](./screenshots/Screenshot%202025-09-13%20130633.png)
- **User Account Page:**
  ![User Account Page](./screenshots/Screenshot%202025-09-13%20130742.png)
  ![User Account Page](./screenshots/Screenshot%202025-09-13%20130725.png)

## ✨ Features

- **User Authentication:** Secure user sign-up and login.
- **AI Music Generation:** Users can input prompts to generate unique music tracks.
- **Music Player:** A built-in player to listen to the generated tracks.
- **Song Management:** Users can view, rename, and manage their generated songs.
- **Responsive Design:** A clean and modern UI that works on all devices.

## Architecture

The application is divided into three main parts: a frontend, a backend, and a database.

### Frontend

The frontend is built with [Next.js](https://nextjs.org/) and [React](https://react.dev/). It provides the user interface for interacting with the application.

- **UI:** Built using [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), and [Lucide Icons](https://lucide.dev/).
- **Authentication:** Handled by [Better Auth](https://better-auth.dev/).
- **State Management:** Uses [Zustand](https://zustand-demo.pmnd.rs/) for global state, particularly for the music player.
- **Background Jobs:** [Inngest](https://www.inngest.com/) is used to manage long-running music generation tasks in the background.

### Backend Technologies

- **Language:** [Python](https://www.python.org/)
- **AI Libraries:** [PyTorch](https://pytorch.org/), [Hugging Face Transformers](https://huggingface.co/docs/transformers/index), [Hugging Face Diffusers](https://huggingface.co/docs/diffusers/index)
- **Cloud SDK:** [Boto3 (for AWS)](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

### Database Technologies

- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20.x or later)
- [npm](https://www.npmjs.com/)
- [Python](https://www.python.org/downloads/) (v3.10 or later)
- [pip](https://pip.pypa.io/en/stable/installation/)
- A PostgreSQL database

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/ai-music-generator.git
    cd ai-music-generator
    ```

2. **Set up the frontend:**

    ```bash
    cd frontend
    npm install
    ```

3. **Set up the backend:**

    ```bash
    cd ../backend
    pip install -r requirements.txt
    ```

4. **Set up environment variables:**

    - In the `frontend` directory, create a `.env.local` file by copying the `.env.example` (if it exists).
    - Add your database connection string and other required environment variables.

    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    # Add other environment variables for AWS, Auth, etc.
    ```

### Running the Application

1. **Start the database:**
    Make sure your PostgreSQL server is running.

2. **Apply database migrations:**

    ```bash
    cd frontend
    npx prisma migrate dev
    ```

3. **Start the frontend development server:**

    ```bash
    npm run dev
    ```

4. **Start the backend server:**

    ```bash
    cd ../backend
    python main.py
    ```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

Here is an overview of the key files and directories in the project:

````text
.
├── backend/
│   ├── main.py           # Main entry point for the backend AI service
│   ├── prompts.py        # Logic for handling prompts
│   └── requirements.txt  # Python dependencies
│
└── frontend/
    ├── prisma/
    │   └── schema.prisma # Database schema definition
    ├── public/           # Static assets
    ├── src/
    │   ├── app/          # Next.js app router pages and layouts
    │   ├── actions/      # Next.js server actions
    │   ├── components/   # Reusable React components
    │   ├── inngest/      # Inngest client and background functions
    │   ├── lib/          # Utility functions and libraries
    │   ├── server/       # Server-side utilities (e.g., db client)
    │   └── stores/       # Zustand state management stores
    ├── next.config.js    # Next.js configuration
    └── package.json      # Frontend dependencies and scripts
````
