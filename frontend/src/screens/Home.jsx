import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null); // To show the error message
    const navigate = useNavigate();

    const MAX_PROJECT_NAME_LENGTH = 15; 

    // Create project function
    function createProject(e) {
        e.preventDefault();

        if (projectName.length > MAX_PROJECT_NAME_LENGTH) {
            setError(`Project name cannot exceed ${MAX_PROJECT_NAME_LENGTH} characters.`);
            return;
        }

        const projectExists = projects.some((proj) => proj.name.toLowerCase() === projectName.toLowerCase());

        if (projectExists) {
            setError('Project already exists. Please choose a different name.');
            return;
        }

        setError(null);

        // Create the project if the name is unique
        axios.post('/projects/create', { name: projectName })
            .then((res) => {
                console.log("Create Project Response:", res.data);
                setIsModalOpen(false);
                setProjectName('');
                // Fetch updated projects list after creating a new project
                return axios.get('/projects/all');
            })
            .then((res) => {
                setProjects(res.data.projects || []);
            })
            .catch((error) => {
                console.log("Error:", error);
                setError('An error occurred while creating the project. Please try again.');
            });
    }

    // Fetch all projects when the component mounts
    useEffect(() => {
        axios.get('/projects/all')
            .then((res) => {
                setProjects(res.data.projects || []);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <main className='p-8 bg-white-200 min-h-screen'>
            <div className="flex justify-between items-center mb-8 text-black">
                <h1 className="text-3xl font-bold text-shadow-lg">
                    Welcome, {user?.email || 'user'}!
                </h1>
            </div>

            <div className="projects flex flex-wrap gap-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="project p-5 border border-gray-300 bg-gray-500 rounded-md bg-gray text-white hover:bg-gradient-to-r from-gray-600 to-gray-800 transition-all duration-300 ease-in-out shadow-lg flex items-center gap-2">
                    New Project
                    <i className="ri-link ml-2"></i>
                </button>

                {/* Display the "No projects found" message below the New Project button */}
                {projects.length === 0 && (
                    <div className="mt-4 text-white text-lg">
                        <p>No projects found. Create one to get started!</p>
                    </div>
                )}
            </div>

            {/* Display the list of existing projects if any */}
            {projects.length > 0 && (
                <div className="projects flex flex-wrap gap-6 mt-4">
                    {projects.map((proj) => (
                        proj && proj.name && (
                            <div key={proj._id}
                                onClick={() => {
                                    navigate(`/project`, {
                                        state: { project: proj },
                                    });
                                }}
                                className="project flex flex-col gap-4 cursor-pointer p-5 border border-gray rounded-md min-w-56 bg-gray-500 hover:bg-gradient-to-r from-gray-600 to-gray-800 text-white transition-all duration-300 ease-in-out shadow-lg">
                                <h2 className="text-xl font-semibold">{proj.name}</h2>
                                <div className="flex gap-2 text-sm">
                                    <p>
                                        <small><i className="ri-user-line"></i> Collaborators</small> :
                                    </p>
                                    {proj.users.length}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Modal for creating a new project */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-1/3">
                        <h2 className="text-2xl mb-6 text-center font-semibold">Create New Project</h2>

                        {/* Show error if project name already exists */}
                        {error && (
                            <div className="bg-red-100 text-red-800 p-2 mb-4 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-lg font-medium text-gray-800">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text"
                                    className="mt-2 block w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    maxLength={MAX_PROJECT_NAME_LENGTH} // Add maxLength attribute
                                    required
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-600 rounded-md text-white font-semibold hover:bg-red-500"
                                    onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-500 text-white font-semibold  rounded-md hover:bg-indigo-700 transition duration-200 hover:bg-yellow-600 focus:ring-2">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Home;
