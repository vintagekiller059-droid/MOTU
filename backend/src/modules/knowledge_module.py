"""Knowledge Module — provides factual context.

Detects the domain of the query and returns relevant stub facts.
In production, this integrates with Wikipedia, local docs, or a vector DB.
"""

import time
from typing import Dict, Any, List


class KnowledgeModule:
    """Retrieves or synthesizes factual knowledge relevant to the query."""

    # Domain → list of stub facts (production: replace with real KB lookup)
    DOMAIN_STUBS: Dict[str, List[str]] = {
        "physics": [
            "Physics is the natural science that studies matter, energy, and their interactions.",
            "Key branches: mechanics, thermodynamics, electromagnetism, quantum physics, relativity.",
        ],
        "quantum": [
            "Quantum mechanics describes nature at the smallest scales of energy levels of atoms and subatomic particles.",
            "Key concepts: superposition, entanglement, wave-particle duality, uncertainty principle.",
        ],
        "programming": [
            "Programming is the process of designing and building executable computer software.",
            "Key paradigms: imperative, functional, object-oriented, declarative.",
        ],
        "history": [
            "History is the study and documentation of the past.",
            "Primary sources: written documents, oral accounts, artifacts, ecological markers.",
        ],
        "biology": [
            "Biology is the scientific study of life and living organisms.",
            "Key domains: molecular biology, genetics, ecology, evolution, microbiology.",
        ],
        "mathematics": [
            "Mathematics is the study of numbers, quantities, shapes, and patterns.",
            "Key branches: algebra, geometry, calculus, number theory, topology.",
        ],
        "geography": [
            "Geography is the study of Earth\'s landscapes, environments, places, and relationships.",
            "Branches: physical geography, human geography, geomatics.",
        ],
        "technology": [
            "Technology is the application of scientific knowledge for practical purposes.",
            "Key areas: computing, AI, robotics, biotechnology, nanotechnology.",
        ],
        "medicine": [
            "Medicine is the science and practice of diagnosing, treating, and preventing disease.",
            "Branches: anatomy, physiology, pathology, pharmacology, surgery.",
        ],
        "philosophy": [
            "Philosophy is the study of fundamental questions about existence, knowledge, values, reason, and mind.",
            "Branches: metaphysics, epistemology, ethics, logic, aesthetics.",
        ],
        "economics": [
            "Economics is the social science that studies production, distribution, and consumption of goods and services.",
            "Branches: microeconomics, macroeconomics, behavioral economics.",
        ],
        "literature": [
            "Literature is written works, especially those considered of superior or lasting artistic merit.",
            "Genres: fiction, non-fiction, poetry, drama, prose.",
        ],
        "art": [
            "Art is a diverse range of human activities involving creative imagination and expression.",
            "Forms: painting, sculpture, music, dance, theater, film, digital art.",
        ],
        "music": [
            "Music is the art of arranging sound to create combinations of form, harmony, melody, and rhythm.",
            "Elements: pitch, rhythm, dynamics, timbre, texture.",
        ],
        "sports": [
            "Sports are physical activities involving skill, competition, and rules.",
            "Categories: team sports, individual sports, combat sports, motor sports.",
        ],
    }

    DOMAIN_TRIGGERS: Dict[str, List[str]] = {
        "physics": ["physics", "mechanics", "thermodynamics", "electromagnetism", "relativity", "energy", "force", "motion", "gravity", "velocity", "acceleration", "newton", "einstein"],
        "quantum": ["quantum", "superposition", "entanglement", "wave function", "qubit", "planck", "heisenberg", "schrodinger"],
        "programming": ["code", "programming", "bug", "error", "function", "api", "algorithm", "data structure", "compiler", "runtime", "debug", "syntax", "variable", "class", "object"],
        "history": ["history", "war", "century", "ancient", "civilization", "empire", "dynasty", "revolution", "treaty", "colonial", "medieval", "renaissance", "industrial"],
        "biology": ["biology", "cell", "organism", "dna", "gene", "evolution", "ecosystem", "species", "photosynthesis", "mitochondria", "protein", "enzyme"],
        "mathematics": ["math", "mathematics", "equation", "formula", "theorem", "proof", "calculus", "algebra", "geometry", "statistics", "probability", "vector", "matrix"],
        "geography": ["geography", "continent", "country", "capital", "mountain", "river", "ocean", "climate", "latitude", "longitude", "demographics"],
        "technology": ["technology", "computer", "internet", "software", "hardware", "network", "cloud", "cybersecurity", "blockchain", "vr", "ar", "iot"],
        "medicine": ["medicine", "disease", "symptom", "diagnosis", "treatment", "vaccine", "antibiotic", "surgery", "anatomy", "physiology", "pathology"],
        "philosophy": ["philosophy", "ethics", "morality", "existentialism", "metaphysics", "epistemology", "logic", "consciousness", "free will", "determinism"],
        "economics": ["economics", "economy", "market", "supply", "demand", "inflation", "gdp", "recession", "investment", "stock", "trade", "currency"],
        "literature": ["literature", "novel", "poem", "poetry", "prose", "author", "writer", "fiction", "non-fiction", "genre", "narrative", "character", "plot"],
        "art": ["art", "painting", "sculpture", "artist", "gallery", "museum", "masterpiece", "renaissance art", "impressionism", "abstract"],
        "music": ["music", "song", "composer", "symphony", "orchestra", "melody", "harmony", "rhythm", "genre", "instrument", "piano", "guitar"],
        "sports": ["sports", "football", "basketball", "cricket", "tennis", "olympics", "athlete", "tournament", "championship", "league"],
    }

    async def run(self, user_content: str) -> Dict[str, Any]:
        t0 = time.perf_counter()
        result = {
            "facts": [],
            "latency_ms": 0.0,
        }

        try:
            q = user_content.lower()
            detected_domains: set[str] = set()

            for domain, triggers in self.DOMAIN_TRIGGERS.items():
                for trigger in triggers:
                    if trigger in q:
                        detected_domains.add(domain)
                        break

            for domain in detected_domains:
                stubs = self.DOMAIN_STUBS.get(domain, [])
                result["facts"].append(f"[{domain.upper()} DOMAIN]")
                result["facts"].extend(stubs)

            if not detected_domains:
                result["facts"].append("[NO SPECIFIC KNOWLEDGE DOMAIN DETECTED]")

        except Exception as e:
            result["error"] = str(e)

        result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 3)
        return result
