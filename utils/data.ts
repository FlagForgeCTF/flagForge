import { NavbarItems, Questions } from "@/interfaces";

export const NavbarData: NavbarItems[] = [
  {
    href: "/home",
    tags: "Home",
    style: undefined
  },
  {
    href: "/problems",
    tags: "Problems",
    style: undefined
  },
  {
    href: "/paths",
    tags: "Paths",
    style: undefined
  },
  {
    href: "/leaderboard",
    tags: "Leaderboard",
    style: undefined
  },
  {
    href: "/archives",
    tags: "Archives",
    style: undefined
  },
  {
    href: "/learn-grc",
    tags: "Learn GRC",
    style: undefined
  },
  {
    href: "https://blog.flagforgectf.com",
    tags: "Blogs",
    style: undefined
  },
];



const ctfQuestions: Questions[] = [
  {
    title: "Reverse Engineering",
    description:
      "Reverse engineer the provided binary and find the hidden flag.",
    category: "Binary Exploitation",
    points: 300,
    flag: "REVERSE_FLAG",
    isSolved: false,
    done: false
  },
  {
    title: "Web Exploitation",
    description: "Find the vulnerability in the provided web to retrieve the flag.",
    category: "Web Security",
    points: 200,
    flag: "WEB_FLAG",
    isSolved: false,
    done: false
  },
  {
    title: "Forensics",
    description: "Analyze the provided image file to extract the hidden flag.",
    category: "Digital Forensics",
    points: 150,
    flag: "FORENSICS_FLAG",
    isSolved: false,
    done: false
  },
  {
    title: "Crypto Challenge",
    description: "Decrypt the provided ciphertext to reveal the flag.",
    category: "Cryptography",
    points: 250,
    flag: "CRYPTO_FLAG",
    isSolved: false,
    done: false
  },
  {
    title: "Steganography",
    description: "Identify and extract the hidden message from the provided image.",
    category: "Steganography",
    points: 200,
    flag: "STEGANOGRAPHY_FLAG",
    isSolved: false,
    done: false
  },
  {
    title: "Network Security",
    description: "Capture and analyze the network traffic to find the flag.",
    category: "Network Security",
    points: 300,
    flag: "NETWORK_FLAG",
    isSolved: false,
    done: false
  },
];


const dummyQuestions: Questions[] = ctfQuestions;


export default dummyQuestions;


export const initialQuestion: Questions = {
  title: "",
  description: "",
  category: "",
  points: 0,
  flag: "",
  isSolved: false,
  done: false
};
