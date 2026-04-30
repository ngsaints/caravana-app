<!DOCTYPE html>

<html lang="pt-BR">

<head>

&#x20;   <meta charset="UTF-8">

&#x20;   <meta name="viewport" content="width=device-width, initial-scale=1.0">

&#x20;   <title>Caravana da Cultura - Espírito Santo</title>

&#x20;   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

&#x20;   <link rel="preconnect" href="https://fonts.googleapis.com">

&#x20;   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

&#x20;   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700\&family=Playfair+Display:wght@600;700\&display=swap" rel="stylesheet">

&#x20;   <style>

&#x20;       \*, \*::before, \*::after {

&#x20;           margin: 0;

&#x20;           padding: 0;

&#x20;           box-sizing: border-box;

&#x20;       }



&#x20;       :root {

&#x20;           --bg-cream: #F8F4EE;

&#x20;           --bg-light: #FDF9F3;

&#x20;           --purple-dark: #3B2369;

&#x20;           --purple-medium: #5A3D8A;

&#x20;           --purple-light: #7B5BB5;

&#x20;           --green-dark: #0D5C4A;

&#x20;           --green-medium: #1A7A63;

&#x20;           --green-light: #2A9D7B;

&#x20;           --orange: #E87A2E;

&#x20;           --orange-light: #F4A64B;

&#x20;           --text-dark: #2D2240;

&#x20;           --text-medium: #5A5070;

&#x20;           --text-light: #8A80A0;

&#x20;           --border: #E0D8CC;

&#x20;           --border-light: #EDE8DF;

&#x20;           --white: #FFFFFF;

&#x20;           --shadow: 0 2px 8px rgba(59, 35, 105, 0.08);

&#x20;           --shadow-lg: 0 8px 32px rgba(59, 35, 105, 0.12);

&#x20;       }



&#x20;       html {

&#x20;           scroll-behavior: smooth;

&#x20;       }



&#x20;       body {

&#x20;           font-family: 'Inter', sans-serif;

&#x20;           background-color: var(--bg-cream);

&#x20;           color: var(--text-dark);

&#x20;           line-height: 1.6;

&#x20;           overflow-x: hidden;

&#x20;       }



&#x20;       /\* Header \*/

&#x20;       .header {

&#x20;           background: var(--bg-cream);

&#x20;           border-bottom: 1px solid var(--border-light);

&#x20;           position: sticky;

&#x20;           top: 0;

&#x20;           z-index: 1000;

&#x20;           padding: 0.75rem 0;

&#x20;       }



&#x20;       .header-inner {

&#x20;           max-width: 1280px;

&#x20;           margin: 0 auto;

&#x20;           padding: 0 2rem;

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           justify-content: space-between;

&#x20;           gap: 2rem;

&#x20;       }



&#x20;       .logo-section {

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           gap: 1rem;

&#x20;           flex-shrink: 0;

&#x20;       }



&#x20;       .logo-img {

&#x20;           width: 90px;

&#x20;           height: 90px;

&#x20;           object-fit: contain;

&#x20;       }



&#x20;       .logo-text {

&#x20;           display: flex;

&#x20;           flex-direction: column;

&#x20;       }



&#x20;       .logo-title {

&#x20;           font-family: 'Playfair Display', serif;

&#x20;           font-size: 1.1rem;

&#x20;           font-weight: 700;

&#x20;           color: var(--purple-dark);

&#x20;           line-height: 1.2;

&#x20;       }



&#x20;       .logo-subtitle {

&#x20;           font-size: 0.75rem;

&#x20;           color: var(--green-dark);

&#x20;           font-weight: 500;

&#x20;       }



&#x20;       nav {

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           gap: 0.25rem;

&#x20;       }



&#x20;       nav a {

&#x20;           text-decoration: none;

&#x20;           color: var(--text-medium);

&#x20;           font-size: 0.875rem;

&#x20;           font-weight: 500;

&#x20;           padding: 0.5rem 1rem;

&#x20;           border-radius: 8px;

&#x20;           transition: all 0.2s ease;

&#x20;           position: relative;

&#x20;       }



&#x20;       nav a:hover {

&#x20;           color: var(--purple-dark);

&#x20;           background: rgba(59, 35, 105, 0.05);

&#x20;       }



&#x20;       nav a.active {

&#x20;           color: var(--orange);

&#x20;           font-weight: 600;

&#x20;       }



&#x20;       nav a.active::after {

&#x20;           content: '';

&#x20;           position: absolute;

&#x20;           bottom: 0;

&#x20;           left: 50%;

&#x20;           transform: translateX(-50%);

&#x20;           width: 24px;

&#x20;           height: 2px;

&#x20;           background: var(--orange);

&#x20;           border-radius: 1px;

&#x20;       }



&#x20;       .btn-primary {

&#x20;           background: var(--purple-dark);

&#x20;           color: var(--white);

&#x20;           border: none;

&#x20;           padding: 0.7rem 1.5rem;

&#x20;           border-radius: 50px;

&#x20;           font-size: 0.8rem;

&#x20;           font-weight: 600;

&#x20;           cursor: pointer;

&#x20;           transition: all 0.3s ease;

&#x20;           white-space: nowrap;

&#x20;           letter-spacing: 0.02em;

&#x20;       }



&#x20;       .btn-primary:hover {

&#x20;           background: var(--purple-medium);

&#x20;           transform: translateY(-1px);

&#x20;           box-shadow: 0 4px 12px rgba(59, 35, 105, 0.3);

&#x20;       }



&#x20;       .mobile-menu-btn {

&#x20;           display: none;

&#x20;           background: none;

&#x20;           border: none;

&#x20;           cursor: pointer;

&#x20;           padding: 0.5rem;

&#x20;           color: var(--purple-dark);

&#x20;       }



&#x20;       .mobile-menu-btn svg {

&#x20;           width: 28px;

&#x20;           height: 28px;

&#x20;       }



&#x20;       /\* Hero Section \*/

&#x20;       .hero {

&#x20;           max-width: 1280px;

&#x20;           margin: 0 auto;

&#x20;           padding: 2rem 2rem 0;

&#x20;           display: grid;

&#x20;           grid-template-columns: 1fr 1.2fr;

&#x20;           gap: 2rem;

&#x20;           align-items: start;

&#x20;       }



&#x20;       .hero-left {

&#x20;           padding-top: 1.5rem;

&#x20;       }



&#x20;       .hero-title {

&#x20;           font-family: 'Playfair Display', serif;

&#x20;           font-size: 2.25rem;

&#x20;           font-weight: 700;

&#x20;           color: var(--purple-dark);

&#x20;           line-height: 1.2;

&#x20;           margin-bottom: 1rem;

&#x20;       }



&#x20;       .hero-title span {

&#x20;           color: var(--green-dark);

&#x20;       }



&#x20;       .hero-description {

&#x20;           font-size: 0.95rem;

&#x20;           color: var(--text-medium);

&#x20;           line-height: 1.7;

&#x20;           margin-bottom: 1.5rem;

&#x20;           max-width: 400px;

&#x20;       }



&#x20;       .stats-row {

&#x20;           display: flex;

&#x20;           gap: 1rem;

&#x20;           margin-bottom: 1.5rem;

&#x20;       }



&#x20;       .stat-card {

&#x20;           background: var(--white);

&#x20;           border: 1px solid var(--border-light);

&#x20;           border-radius: 12px;

&#x20;           padding: 1rem 1.5rem;

&#x20;           text-align: center;

&#x20;           flex: 1;

&#x20;           transition: all 0.3s ease;

&#x20;       }



&#x20;       .stat-card:hover {

&#x20;           box-shadow: var(--shadow);

&#x20;           border-color: var(--purple-light);

&#x20;       }



&#x20;       .stat-number {

&#x20;           font-family: 'Playfair Display', serif;

&#x20;           font-size: 2rem;

&#x20;           font-weight: 700;

&#x20;           color: var(--green-dark);

&#x20;           line-height: 1;

&#x20;       }



&#x20;       .stat-label {

&#x20;           font-size: 0.7rem;

&#x20;           color: var(--text-light);

&#x20;           text-transform: uppercase;

&#x20;           letter-spacing: 0.05em;

&#x20;           margin-top: 0.25rem;

&#x20;           font-weight: 600;

&#x20;       }



&#x20;       .explore-hint {

&#x20;           display: flex;

&#x20;           align-items: flex-start;

&#x20;           gap: 0.75rem;

&#x20;           background: rgba(232, 122, 46, 0.06);

&#x20;           border-radius: 12px;

&#x20;           padding: 1rem;

&#x20;           border: 1px solid rgba(232, 122, 46, 0.15);

&#x20;       }



&#x20;       .explore-icon {

&#x20;           flex-shrink: 0;

&#x20;           width: 36px;

&#x20;           height: 36px;

&#x20;           background: rgba(232, 122, 46, 0.12);

&#x20;           border-radius: 50%;

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           justify-content: center;

&#x20;       }



&#x20;       .explore-icon svg {

&#x20;           width: 20px;

&#x20;           height: 20px;

&#x20;           color: var(--orange);

&#x20;       }



&#x20;       .explore-text {

&#x20;           font-size: 0.85rem;

&#x20;           color: var(--text-medium);

&#x20;           line-height: 1.6;

&#x20;       }



&#x20;       /\* Map Container \*/

&#x20;       .map-wrapper {

&#x20;           position: relative;

&#x20;           border-radius: 16px;

&#x20;           overflow: hidden;

&#x20;           box-shadow: var(--shadow-lg);

&#x20;           border: 2px solid var(--border-light);

&#x20;           height: 520px;

&#x20;       }



&#x20;       #map {

&#x20;           width: 100%;

&#x20;           height: 100%;

&#x20;           border-radius: 14px;

&#x20;       }



&#x20;       .map-controls {

&#x20;           position: absolute;

&#x20;           top: 12px;

&#x20;           left: 12px;

&#x20;           z-index: 1000;

&#x20;           display: flex;

&#x20;           gap: 0;

&#x20;           background: var(--white);

&#x20;           border-radius: 8px;

&#x20;           overflow: hidden;

&#x20;           box-shadow: 0 2px 8px rgba(0,0,0,0.15);

&#x20;       }



&#x20;       .map-control-btn {

&#x20;           padding: 0.5rem 1rem;

&#x20;           border: none;

&#x20;           background: var(--white);

&#x20;           font-size: 0.8rem;

&#x20;           font-weight: 600;

&#x20;           color: var(--text-medium);

&#x20;           cursor: pointer;

&#x20;           transition: all 0.2s;

&#x20;           font-family: 'Inter', sans-serif;

&#x20;       }



&#x20;       .map-control-btn.active {

&#x20;           background: var(--purple-dark);

&#x20;           color: var(--white);

&#x20;       }



&#x20;       .map-control-btn:first-child {

&#x20;           border-radius: 8px 0 0 8px;

&#x20;       }



&#x20;       .map-control-btn:last-child {

&#x20;           border-radius: 0 8px 8px 0;

&#x20;       }



&#x20;       .map-control-btn:not(.active):hover {

&#x20;           background: var(--bg-cream);

&#x20;       }



&#x20;       /\* Filter Section \*/

&#x20;       .filter-section {

&#x20;           max-width: 1280px;

&#x20;           margin: 2rem auto;

&#x20;           padding: 0 2rem;

&#x20;       }



&#x20;       .filter-bar {

&#x20;           background: var(--white);

&#x20;           border: 1px solid var(--border-light);

&#x20;           border-radius: 16px;

&#x20;           padding: 1rem 1.25rem;

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           gap: 0.75rem;

&#x20;           flex-wrap: wrap;

&#x20;           box-shadow: var(--shadow);

&#x20;       }



&#x20;       .search-input-wrapper {

&#x20;           position: relative;

&#x20;           flex: 1;

&#x20;           min-width: 200px;

&#x20;       }



&#x20;       .search-input-wrapper input {

&#x20;           width: 100%;

&#x20;           padding: 0.65rem 2.5rem 0.65rem 1rem;

&#x20;           border: 1px solid var(--border);

&#x20;           border-radius: 10px;

&#x20;           font-size: 0.85rem;

&#x20;           font-family: 'Inter', sans-serif;

&#x20;           color: var(--text-dark);

&#x20;           background: var(--bg-light);

&#x20;           transition: all 0.2s;

&#x20;           outline: none;

&#x20;       }



&#x20;       .search-input-wrapper input:focus {

&#x20;           border-color: var(--purple-light);

&#x20;           background: var(--white);

&#x20;           box-shadow: 0 0 0 3px rgba(90, 61, 138, 0.1);

&#x20;       }



&#x20;       .search-input-wrapper input::placeholder {

&#x20;           color: var(--text-light);

&#x20;       }



&#x20;       .search-icon {

&#x20;           position: absolute;

&#x20;           right: 10px;

&#x20;           top: 50%;

&#x20;           transform: translateY(-50%);

&#x20;           color: var(--text-light);

&#x20;           pointer-events: none;

&#x20;       }



&#x20;       .search-icon svg {

&#x20;           width: 18px;

&#x20;           height: 18px;

&#x20;       }



&#x20;       .filter-select {

&#x20;           padding: 0.65rem 2rem 0.65rem 1rem;

&#x20;           border: 1px solid var(--border);

&#x20;           border-radius: 10px;

&#x20;           font-size: 0.85rem;

&#x20;           font-family: 'Inter', sans-serif;

&#x20;           color: var(--text-dark);

&#x20;           background: var(--bg-light);

&#x20;           cursor: pointer;

&#x20;           appearance: none;

&#x20;           -webkit-appearance: none;

&#x20;           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A80A0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");

&#x20;           background-repeat: no-repeat;

&#x20;           background-position: right 0.75rem center;

&#x20;           transition: all 0.2s;

&#x20;           outline: none;

&#x20;           min-width: 160px;

&#x20;       }



&#x20;       .filter-select:focus {

&#x20;           border-color: var(--purple-light);

&#x20;           background-color: var(--white);

&#x20;           box-shadow: 0 0 0 3px rgba(90, 61, 138, 0.1);

&#x20;       }



&#x20;       .btn-clear {

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           gap: 0.4rem;

&#x20;           padding: 0.65rem 1.2rem;

&#x20;           border: none;

&#x20;           background: transparent;

&#x20;           color: var(--purple-medium);

&#x20;           font-size: 0.8rem;

&#x20;           font-weight: 600;

&#x20;           cursor: pointer;

&#x20;           border-radius: 10px;

&#x20;           transition: all 0.2s;

&#x20;           font-family: 'Inter', sans-serif;

&#x20;           white-space: nowrap;

&#x20;       }



&#x20;       .btn-clear:hover {

&#x20;           background: rgba(90, 61, 138, 0.08);

&#x20;           color: var(--purple-dark);

&#x20;       }



&#x20;       .btn-clear svg {

&#x20;           width: 16px;

&#x20;           height: 16px;

&#x20;       }



&#x20;       /\* Associations Section \*/

&#x20;       .associations-section {

&#x20;           max-width: 1280px;

&#x20;           margin: 0 auto;

&#x20;           padding: 0 2rem 3rem;

&#x20;       }



&#x20;       .section-title {

&#x20;           font-family: 'Playfair Display', serif;

&#x20;           font-size: 1.35rem;

&#x20;           font-weight: 700;

&#x20;           color: var(--purple-dark);

&#x20;           margin-bottom: 1.25rem;

&#x20;       }



&#x20;       .associations-table {

&#x20;           width: 100%;

&#x20;           border-collapse: collapse;

&#x20;       }



&#x20;       .associations-table thead th {

&#x20;           text-align: left;

&#x20;           padding: 0.75rem 1rem;

&#x20;           font-size: 0.7rem;

&#x20;           font-weight: 700;

&#x20;           text-transform: uppercase;

&#x20;           letter-spacing: 0.08em;

&#x20;           color: var(--text-light);

&#x20;           border-bottom: 2px solid var(--border-light);

&#x20;           white-space: nowrap;

&#x20;       }



&#x20;       .associations-table tbody td {

&#x20;           padding: 1rem;

&#x20;           font-size: 0.85rem;

&#x20;           color: var(--text-dark);

&#x20;           border-bottom: 1px solid var(--border-light);

&#x20;           vertical-align: middle;

&#x20;       }



&#x20;       .associations-table tbody tr {

&#x20;           transition: background 0.2s;

&#x20;       }



&#x20;       .associations-table tbody tr:hover {

&#x20;           background: rgba(59, 35, 105, 0.02);

&#x20;       }



&#x20;       .table-empty {

&#x20;           color: var(--text-light);

&#x20;           font-style: italic;

&#x20;       }



&#x20;       .table-link {

&#x20;           display: inline-flex;

&#x20;           align-items: center;

&#x20;           gap: 0.3rem;

&#x20;           color: var(--purple-medium);

&#x20;           text-decoration: none;

&#x20;           font-size: 0.8rem;

&#x20;           font-weight: 500;

&#x20;           transition: color 0.2s;

&#x20;       }



&#x20;       .table-link:hover {

&#x20;           color: var(--purple-dark);

&#x20;       }



&#x20;       .table-link svg {

&#x20;           width: 16px;

&#x20;           height: 16px;

&#x20;       }



&#x20;       /\* Footer \*/

&#x20;       .footer-info {

&#x20;           background: var(--green-dark);

&#x20;           padding: 3rem 2rem;

&#x20;       }



&#x20;       .footer-info-inner {

&#x20;           max-width: 1280px;

&#x20;           margin: 0 auto;

&#x20;           display: grid;

&#x20;           grid-template-columns: repeat(3, 1fr);

&#x20;           gap: 3rem;

&#x20;       }



&#x20;       .footer-info-item {

&#x20;           display: flex;

&#x20;           align-items: flex-start;

&#x20;           gap: 1rem;

&#x20;       }



&#x20;       .footer-icon {

&#x20;           flex-shrink: 0;

&#x20;           width: 48px;

&#x20;           height: 48px;

&#x20;           background: rgba(255, 255, 255, 0.12);

&#x20;           border-radius: 12px;

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;           justify-content: center;

&#x20;       }



&#x20;       .footer-icon svg {

&#x20;           width: 26px;

&#x20;           height: 26px;

&#x20;           color: var(--white);

&#x20;       }



&#x20;       .footer-info-text h3 {

&#x20;           font-size: 0.85rem;

&#x20;           font-weight: 700;

&#x20;           color: var(--white);

&#x20;           text-transform: uppercase;

&#x20;           letter-spacing: 0.05em;

&#x20;           margin-bottom: 0.3rem;

&#x20;           line-height: 1.4;

&#x20;       }



&#x20;       .footer-info-text p {

&#x20;           font-size: 0.8rem;

&#x20;           color: rgba(255, 255, 255, 0.75);

&#x20;           line-height: 1.5;

&#x20;       }



&#x20;       .footer-bottom {

&#x20;           background: var(--purple-dark);

&#x20;           padding: 1.25rem 2rem;

&#x20;       }



&#x20;       .footer-bottom-inner {

&#x20;           max-width: 1280px;

&#x20;           margin: 0 auto;

&#x20;           display: flex;

&#x20;           justify-content: space-between;

&#x20;           align-items: center;

&#x20;       }



&#x20;       .footer-bottom p {

&#x20;           font-size: 0.75rem;

&#x20;           color: rgba(255, 255, 255, 0.6);

&#x20;       }



&#x20;       .footer-links {

&#x20;           display: flex;

&#x20;           gap: 1rem;

&#x20;           align-items: center;

&#x20;       }



&#x20;       .footer-links a {

&#x20;           font-size: 0.75rem;

&#x20;           color: rgba(255, 255, 255, 0.6);

&#x20;           text-decoration: none;

&#x20;           transition: color 0.2s;

&#x20;       }



&#x20;       .footer-links a:hover {

&#x20;           color: rgba(255, 255, 255, 0.9);

&#x20;       }



&#x20;       .footer-divider {

&#x20;           width: 1px;

&#x20;           height: 14px;

&#x20;           background: rgba(255, 255, 255, 0.3);

&#x20;       }



&#x20;       /\* Animations \*/

&#x20;       @keyframes fadeInUp {

&#x20;           from {

&#x20;               opacity: 0;

&#x20;               transform: translateY(20px);

&#x20;           }

&#x20;           to {

&#x20;               opacity: 1;

&#x20;               transform: translateY(0);

&#x20;           }

&#x20;       }



&#x20;       .animate-in {

&#x20;           animation: fadeInUp 0.6s ease forwards;

&#x20;       }



&#x20;       .delay-1 { animation-delay: 0.1s; }

&#x20;       .delay-2 { animation-delay: 0.2s; }

&#x20;       .delay-3 { animation-delay: 0.3s; }



&#x20;       /\* Responsive \*/

&#x20;       @media (max-width: 1024px) {

&#x20;           .hero {

&#x20;               grid-template-columns: 1fr;

&#x20;               gap: 1.5rem;

&#x20;           }



&#x20;           .map-wrapper {

&#x20;               height: 400px;

&#x20;           }



&#x20;           .hero-left {

&#x20;               padding-top: 0;

&#x20;           }

&#x20;       }



&#x20;       @media (max-width: 768px) {

&#x20;           .header-inner {

&#x20;               padding: 0 1rem;

&#x20;           }



&#x20;           nav {

&#x20;               display: none;

&#x20;               position: absolute;

&#x20;               top: 100%;

&#x20;               left: 0;

&#x20;               right: 0;

&#x20;               background: var(--bg-cream);

&#x20;               border-bottom: 1px solid var(--border-light);

&#x20;               flex-direction: column;

&#x20;               padding: 1rem;

&#x20;               gap: 0.25rem;

&#x20;               box-shadow: var(--shadow-lg);

&#x20;           }



&#x20;           nav.open {

&#x20;               display: flex;

&#x20;           }



&#x20;           nav a {

&#x20;               width: 100%;

&#x20;               text-align: center;

&#x20;               padding: 0.75rem 1rem;

&#x20;           }



&#x20;           .mobile-menu-btn {

&#x20;               display: block;

&#x20;           }



&#x20;           .hero {

&#x20;               padding: 1.5rem 1rem 0;

&#x20;           }



&#x20;           .hero-title {

&#x20;               font-size: 1.75rem;

&#x20;           }



&#x20;           .stats-row {

&#x20;               flex-direction: column;

&#x20;           }



&#x20;           .filter-bar {

&#x20;               flex-direction: column;

&#x20;               align-items: stretch;

&#x20;           }



&#x20;           .filter-select {

&#x20;               width: 100%;

&#x20;               min-width: unset;

&#x20;           }



&#x20;           .associations-table {

&#x20;               font-size: 0.8rem;

&#x20;           }



&#x20;           .associations-section {

&#x20;               padding: 0 1rem 2rem;

&#x20;               overflow-x: auto;

&#x20;           }



&#x20;           .footer-info-inner {

&#x20;               grid-template-columns: 1fr;

&#x20;               gap: 2rem;

&#x20;           }



&#x20;           .footer-bottom-inner {

&#x20;               flex-direction: column;

&#x20;               gap: 0.75rem;

&#x20;               text-align: center;

&#x20;           }



&#x20;           .map-wrapper {

&#x20;               height: 320px;

&#x20;           }

&#x20;       }



&#x20;       @media (max-width: 480px) {

&#x20;           .hero-title {

&#x20;               font-size: 1.5rem;

&#x20;           }



&#x20;           .logo-img {

&#x20;               width: 60px;

&#x20;               height: 60px;

&#x20;           }



&#x20;           .btn-primary {

&#x20;               padding: 0.6rem 1.2rem;

&#x20;               font-size: 0.7rem;

&#x20;           }

&#x20;       }



&#x20;       /\* Leaflet custom styles \*/

&#x20;       .leaflet-control-zoom {

&#x20;           border: none !important;

&#x20;           box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;

&#x20;           border-radius: 10px !important;

&#x20;           overflow: hidden;

&#x20;       }



&#x20;       .leaflet-control-zoom a {

&#x20;           border: none !important;

&#x20;           width: 36px !important;

&#x20;           height: 36px !important;

&#x20;           line-height: 36px !important;

&#x20;           font-size: 18px !important;

&#x20;           color: var(--purple-dark) !important;

&#x20;           border-radius: 0 !important;

&#x20;       }



&#x20;       .leaflet-control-zoom a:hover {

&#x20;           background: var(--bg-cream) !important;

&#x20;       }



&#x20;       .leaflet-control-attribution {

&#x20;           font-size: 10px !important;

&#x20;           background: rgba(255,255,255,0.9) !important;

&#x20;           border-radius: 6px 0 0 0 !important;

&#x20;           padding: 2px 6px !important;

&#x20;       }



&#x20;       .custom-marker {

&#x20;           background: none;

&#x20;           border: none;

&#x20;       }



&#x20;       .marker-pin {

&#x20;           width: 32px;

&#x20;           height: 40px;

&#x20;           position: relative;

&#x20;       }



&#x20;       .marker-pin svg {

&#x20;           width: 100%;

&#x20;           height: 100%;

&#x20;           filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));

&#x20;       }

&#x20;   </style>

</head>

<body>

&#x20;   <!-- Header -->

&#x20;   <header class="header">

&#x20;       <div class="header-inner">

&#x20;           <div class="logo-section">

&#x20;               <img src="https://image.qwenlm.ai/public\_source/072141c9-b084-4045-a51f-0ee32952aaad/15ee4deb4-a410-4f95-8009-e09618fbaa57.png" alt="Caravana da Cultura" class="logo-img">

&#x20;           </div>

&#x20;           <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">

&#x20;               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">

&#x20;                   <line x1="3" y1="6" x2="21" y2="6"></line>

&#x20;                   <line x1="3" y1="12" x2="21" y2="12"></line>

&#x20;                   <line x1="3" y1="18" x2="21" y2="18"></line>

&#x20;               </svg>

&#x20;           </button>

&#x20;           <nav id="mainNav">

&#x20;               <a href="#" class="active">INÍCIO</a>

&#x20;               <a href="#">O PROJETO</a>

&#x20;               <a href="#">MAPA</a>

&#x20;               <a href="#">ASSOCIAÇÕES</a>

&#x20;               <a href="#">CONTATO</a>

&#x20;           </nav>

&#x20;           <button class="btn-primary">CADASTRE SUA ASSOCIAÇÃO</button>

&#x20;       </div>

&#x20;   </header>



&#x20;   <!-- Hero Section -->

&#x20;   <section class="hero">

&#x20;       <div class="hero-left">

&#x20;           <h1 class="hero-title animate-in">

&#x20;               Mapa das<br>

&#x20;               Associações Culturais<br>

&#x20;               do <span>Espírito Santo</span>

&#x20;           </h1>

&#x20;           <p class="hero-description animate-in delay-1">

&#x20;               Encontre, conheça e fortaleça as associações culturais que transformam nosso estado todos os dias.

&#x20;           </p>

&#x20;           <div class="stats-row animate-in delay-2">

&#x20;               <div class="stat-card">

&#x20;                   <div class="stat-number" id="assocCount">0</div>

&#x20;                   <div class="stat-label">Associações<br>Cadastradas</div>

&#x20;               </div>

&#x20;               <div class="stat-card">

&#x20;                   <div class="stat-number" id="municipCount">0</div>

&#x20;                   <div class="stat-label">Municípios<br>Alcançados</div>

&#x20;               </div>

&#x20;           </div>

&#x20;           <div class="explore-hint animate-in delay-3">

&#x20;               <div class="explore-icon">

&#x20;                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

&#x20;                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>

&#x20;                       <circle cx="12" cy="10" r="3"></circle>

&#x20;                   </svg>

&#x20;               </div>

&#x20;               <p class="explore-text">

&#x20;                   Explore o mapa ao lado ou filtre por categoria ou município para encontrar iniciativas perto de você.

&#x20;               </p>

&#x20;           </div>

&#x20;       </div>

&#x20;       <div class="map-wrapper animate-in delay-2">

&#x20;           <div class="map-controls">

&#x20;               <button class="map-control-btn active" id="mapBtn">Mapa</button>

&#x20;               <button class="map-control-btn" id="satBtn">Satélite</button>

&#x20;           </div>

&#x20;           <div id="map"></div>

&#x20;       </div>

&#x20;   </section>



&#x20;   <!-- Filter Section -->

&#x20;   <section class="filter-section">

&#x20;       <div class="filter-bar">

&#x20;           <div class="search-input-wrapper">

&#x20;               <input type="text" placeholder="Buscar por nome" id="searchInput">

&#x20;               <div class="search-icon">

&#x20;                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

&#x20;                       <circle cx="11" cy="11" r="8"></circle>

&#x20;                       <line x1="21" y1="21" x2="16.65" y2="16.65"></line>

&#x20;                   </svg>

&#x20;               </div>

&#x20;           </div>

&#x20;           <select class="filter-select" id="categoryFilter">

&#x20;               <option>Todas as categorias</option>

&#x20;               <option>Música</option>

&#x20;               <option>Dança</option>

&#x20;               <option>Teatro</option>

&#x20;               <option>Artes Visuais</option>

&#x20;               <option>Patrimônio Cultural</option>

&#x20;               <option>Cinema</option>

&#x20;               <option>Literatura</option>

&#x20;               <option>Artesanato</option>

&#x20;           </select>

&#x20;           <select class="filter-select" id="municipioFilter">

&#x20;               <option>Todos os municípios</option>

&#x20;               <option>Vitória</option>

&#x20;               <option>Vila Velha</option>

&#x20;               <option>Serra</option>

&#x20;               <option>Cariacica</option>

&#x20;               <option>Cachoeiro de Itapemirim</option>

&#x20;               <option>Colatina</option>

&#x20;               <option>Guarapari</option>

&#x20;               <option>Aracruz</option>

&#x20;               <option>Marataízes</option>

&#x20;               <option>São Mateus</option>

&#x20;               <option>Linhares</option>

&#x20;               <option>Nova Venécia</option>

&#x20;           </select>

&#x20;           <select class="filter-select" id="regiaoFilter">

&#x20;               <option>Todas as regiões</option>

&#x20;               <option>Grande Vitória</option>

&#x20;               <option>Norte do ES</option>

&#x20;               <option>Sul do ES</option>

&#x20;               <option>Central</option>

&#x20;               <option>Serrana</option>

&#x20;           </select>

&#x20;           <button class="btn-clear" id="clearFilters">

&#x20;               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

&#x20;                   <polyline points="1 4 1 10 7 10"></polyline>

&#x20;                   <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>

&#x20;               </svg>

&#x20;               Limpar filtros

&#x20;           </button>

&#x20;       </div>

&#x20;   </section>



&#x20;   <!-- Associations Table -->

&#x20;   <section class="associations-section">

&#x20;       <h2 class="section-title">Associações Cadastradas</h2>

&#x20;       <table class="associations-table">

&#x20;           <thead>

&#x20;               <tr>

&#x20;                   <th>Nome da Associação</th>

&#x20;                   <th>Município</th>

&#x20;                   <th>Categoria</th>

&#x20;                   <th>Região</th>

&#x20;                   <th>Contato</th>

&#x20;               </tr>

&#x20;           </thead>

&#x20;           <tbody id="tableBody">

&#x20;               <tr>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td><a href="#" class="table-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver no mapa</a></td>

&#x20;               </tr>

&#x20;               <tr>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td><a href="#" class="table-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver no mapa</a></td>

&#x20;               </tr>

&#x20;               <tr>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td><a href="#" class="table-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver no mapa</a></td>

&#x20;               </tr>

&#x20;               <tr>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td><a href="#" class="table-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver no mapa</a></td>

&#x20;               </tr>

&#x20;               <tr>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td><a href="#" class="table-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver no mapa</a></td>

&#x20;               </tr>

&#x20;               <tr>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td class="table-empty">—</td>

&#x20;                   <td><a href="#" class="table-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver no mapa</a></td>

&#x20;               </tr>

&#x20;           </tbody>

&#x20;       </table>

&#x20;   </section>



&#x20;   <!-- Footer Info -->

&#x20;   <section class="footer-info">

&#x20;       <div class="footer-info-inner">

&#x20;           <div class="footer-info-item">

&#x20;               <div class="footer-icon">

&#x20;                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">

&#x20;                       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>

&#x20;                       <circle cx="9" cy="7" r="4"></circle>

&#x20;                       <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>

&#x20;                       <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>

&#x20;                   </svg>

&#x20;               </div>

&#x20;               <div class="footer-info-text">

&#x20;                   <h3>Fortalecendo<br>Redes Culturais</h3>

&#x20;                   <p>Conecte-se, colabore e transforme realidades.</p>

&#x20;               </div>

&#x20;           </div>

&#x20;           <div class="footer-info-item">

&#x20;               <div class="footer-icon">

&#x20;                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">

&#x20;                       <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>

&#x20;                       <line x1="8" y1="2" x2="8" y2="18"></line>

&#x20;                       <line x1="16" y1="6" x2="16" y2="22"></line>

&#x20;                   </svg>

&#x20;               </div>

&#x20;               <div class="footer-info-text">

&#x20;                   <h3>Mapa Vivo<br>da Cultura</h3>

&#x20;                   <p>Um panorama das iniciativas culturais capixabas.</p>

&#x20;               </div>

&#x20;           </div>

&#x20;           <div class="footer-info-item">

&#x20;               <div class="footer-icon">

&#x20;                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">

&#x20;                       <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>

&#x20;                   </svg>

&#x20;               </div>

&#x20;               <div class="footer-info-text">

&#x20;                   <h3>Juntos Somos<br>Mais Fortes</h3>

&#x20;                   <p>Valorize a cultura local. Valorize o que é nosso.</p>

&#x20;               </div>

&#x20;           </div>

&#x20;       </div>

&#x20;   </section>



&#x20;   <!-- Footer Bottom -->

&#x20;   <footer class="footer-bottom">

&#x20;       <div class="footer-bottom-inner">

&#x20;           <p>© 2024 Caravana da Cultura – Espírito Santo</p>

&#x20;           <div class="footer-links">

&#x20;               <a href="#">Política de Privacidade</a>

&#x20;               <div class="footer-divider"></div>

&#x20;               <a href="#">Termos de Uso</a>

&#x20;           </div>

&#x20;       </div>

&#x20;   </footer>



&#x20;   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

&#x20;   <script>

&#x20;       // Mobile menu toggle

&#x20;       const mobileMenuBtn = document.getElementById('mobileMenuBtn');

&#x20;       const mainNav = document.getElementById('mainNav');

&#x20;       mobileMenuBtn.addEventListener('click', () => {

&#x20;           mainNav.classList.toggle('open');

&#x20;       });



&#x20;       // Map Controls

&#x20;       const mapBtn = document.getElementById('mapBtn');

&#x20;       const satBtn = document.getElementById('satBtn');

&#x20;       let mapStyle = 'map';



&#x20;       mapBtn.addEventListener('click', () => {

&#x20;           mapStyle = 'map';

&#x20;           mapBtn.classList.add('active');

&#x20;           satBtn.classList.remove('active');

&#x20;           streetsLayer.addTo(map);

&#x20;           satelliteLayer.remove();

&#x20;       });



&#x20;       satBtn.addEventListener('click', () => {

&#x20;           mapStyle = 'satellite';

&#x20;           satBtn.classList.add('active');

&#x20;           mapBtn.classList.remove('active');

&#x20;           satelliteLayer.addTo(map);

&#x20;           streetsLayer.remove();

&#x20;       });



&#x20;       // Initialize Leaflet Map

&#x20;       const map = L.map('map', {

&#x20;           zoomControl: false,

&#x20;           scrollWheelZoom: true,

&#x20;       }).setView(\[-19.92, -40.31], 8);



&#x20;       L.control.zoom({ position: 'bottomright' }).addTo(map);



&#x20;       const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

&#x20;           attribution: '© OpenStreetMap contributors'

&#x20;       });



&#x20;       const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World\_Imagery/MapServer/tile/{z}/{y}/{x}', {

&#x20;           attribution: '© Esri'

&#x20;       });



&#x20;       streetsLayer.addTo(map);



&#x20;       // Add Espírito Santo state boundary outline (simplified)

&#x20;       const esBoundary = \[

&#x20;           \[-18.2, -41.2], \[-18.5, -40.8], \[-18.8, -40.5], \[-19.1, -40.2],

&#x20;           \[-19.4, -39.9], \[-19.7, -39.7], \[-20.0, -39.6], \[-20.3, -39.7],

&#x20;           \[-20.6, -39.9], \[-20.9, -40.1], \[-21.1, -40.5], \[-21.3, -40.8],

&#x20;           \[-21.4, -41.1], \[-21.2, -41.4], \[-20.9, -41.6], \[-20.5, -41.7],

&#x20;           \[-20.1, -41.5], \[-19.7, -41.3], \[-19.3, -41.1], \[-18.9, -41.0],

&#x20;           \[-18.5, -41.1]

&#x20;       ];



&#x20;       L.polygon(esBoundary, {

&#x20;           color: '#1A7A63',

&#x20;           weight: 2,

&#x20;           fillColor: '#2A9D7B',

&#x20;           fillOpacity: 0.15,

&#x20;           smoothFactor: 1

&#x20;       }).addTo(map);



&#x20;       // Municipality markers

&#x20;       const municipalities = \[

&#x20;           { name: 'Vitória', lat: -20.3155, lng: -40.3128 },

&#x20;           { name: 'Vila Velha', lat: -20.3297, lng: -40.2925 },

&#x20;           { name: 'Serra', lat: -20.1287, lng: -40.3075 },

&#x20;           { name: 'Cariacica', lat: -20.2619, lng: -40.4177 },

&#x20;           { name: 'Cachoeiro de Itapemirim', lat: -20.8486, lng: -41.1129 },

&#x20;           { name: 'Colatina', lat: -19.5396, lng: -40.6306 },

&#x20;           { name: 'Guarapari', lat: -20.6686, lng: -40.4988 },

&#x20;           { name: 'Aracruz', lat: -19.8225, lng: -40.2738 },

&#x20;           { name: 'Marataízes', lat: -21.0404, lng: -40.8333 },

&#x20;           { name: 'São Mateus', lat: -18.7157, lng: -39.8578 },

&#x20;           { name: 'Linhares', lat: -19.3908, lng: -40.0723 },

&#x20;           { name: 'Nova Venécia', lat: -18.7105, lng: -40.4038 },

&#x20;           { name: 'Santa Leopoldina', lat: -20.1664, lng: -40.5334 },

&#x20;           { name: 'Domingos Martins', lat: -20.3633, lng: -40.6628 },

&#x20;           { name: 'Itarana', lat: -20.1383, lng: -40.6422 },

&#x20;           { name: 'Mantenópolis', lat: -18.8622, lng: -41.1303 },

&#x20;           { name: 'Venda Nova', lat: -20.3278, lng: -41.1283 },

&#x20;           { name: 'Castelo', lat: -20.6169, lng: -41.1936 },

&#x20;           { name: 'Alegre', lat: -20.7599, lng: -41.5349 },

&#x20;           { name: 'Pinheiros', lat: -18.4173, lng: -40.2155 },

&#x20;           { name: 'Jaguaré', lat: -18.9642, lng: -40.1617 },

&#x20;           { name: 'Conceição da Barra', lat: -18.4974, lng: -39.7394 },

&#x20;           { name: 'Anchieta', lat: -20.8056, lng: -40.6414 },

&#x20;           { name: 'Presidente Kennedy', lat: -21.0936, lng: -41.0536 },

&#x20;           { name: 'Jerônimo Monteiro', lat: -20.7984, lng: -41.3051 },

&#x20;       ];



&#x20;       // Custom marker icon

&#x20;       function createMarkerIcon() {

&#x20;           return L.divIcon({

&#x20;               className: 'custom-marker',

&#x20;               html: `<svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">

&#x20;                   <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#5A3D8A"/>

&#x20;                   <circle cx="12" cy="12" r="5" fill="white"/>

&#x20;               </svg>`,

&#x20;               iconSize: \[24, 32],

&#x20;               iconAnchor: \[12, 32],

&#x20;               popupAnchor: \[0, -32]

&#x20;           });

&#x20;       }



&#x20;       // Add municipality markers

&#x20;       municipalities.forEach(m => {

&#x20;           const marker = L.marker(\[m.lat, m.lng], { icon: createMarkerIcon() })

&#x20;               .addTo(map)

&#x20;               .bindPopup(`<strong style="font-family: Inter, sans-serif; font-size: 13px;">${m.name}</strong>`);

&#x20;       });



&#x20;       // Animate counter

&#x20;       function animateCounter(elementId, target, duration) {

&#x20;           const el = document.getElementById(elementId);

&#x20;           let start = 0;

&#x20;           const startTime = performance.now();



&#x20;           function update(currentTime) {

&#x20;               const elapsed = currentTime - startTime;

&#x20;               const progress = Math.min(elapsed / duration, 1);

&#x20;               const eased = 1 - Math.pow(1 - progress, 3);

&#x20;               const current = Math.round(start + (target - start) \* eased);

&#x20;               el.textContent = current;

&#x20;               if (progress < 1) {

&#x20;                   requestAnimationFrame(update);

&#x20;               }

&#x20;           }

&#x20;           requestAnimationFrame(update);

&#x20;       }



&#x20;       // Start counters on load

&#x20;       setTimeout(() => {

&#x20;           animateCounter('assocCount', 0, 1500);

&#x20;           animateCounter('municipCount', 0, 1500);

&#x20;       }, 500);



&#x20;       // Filter interactions

&#x20;       const searchInput = document.getElementById('searchInput');

&#x20;       const categoryFilter = document.getElementById('categoryFilter');

&#x20;       const municipioFilter = document.getElementById('municipioFilter');

&#x20;       const regiaoFilter = document.getElementById('regiaoFilter');

&#x20;       const clearFilters = document.getElementById('clearFilters');



&#x20;       searchInput.addEventListener('focus', function() {

&#x20;           this.style.borderColor = '#7B5BB5';

&#x20;       });



&#x20;       searchInput.addEventListener('blur', function() {

&#x20;           this.style.borderColor = '#E0D8CC';

&#x20;       });



&#x20;       clearFilters.addEventListener('click', () => {

&#x20;           searchInput.value = '';

&#x20;           categoryFilter.selectedIndex = 0;

&#x20;           municipioFilter.selectedIndex = 0;

&#x20;           regiaoFilter.selectedIndex = 0;

&#x20;           searchInput.style.borderColor = '#E0D8CC';



&#x20;           // Visual feedback

&#x20;           clearFilters.style.transform = 'scale(0.95)';

&#x20;           setTimeout(() => {

&#x20;               clearFilters.style.transform = 'scale(1)';

&#x20;           }, 150);

&#x20;       });



&#x20;       // Nav active state

&#x20;       document.querySelectorAll('nav a').forEach(link => {

&#x20;           link.addEventListener('click', function(e) {

&#x20;               e.preventDefault();

&#x20;               document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));

&#x20;               this.classList.add('active');

&#x20;               mainNav.classList.remove('open');

&#x20;           });

&#x20;       });



&#x20;       // Scroll reveal animation

&#x20;       const observerOptions = {

&#x20;           threshold: 0.1,

&#x20;           rootMargin: '0px 0px -50px 0px'

&#x20;       };



&#x20;       const observer = new IntersectionObserver((entries) => {

&#x20;           entries.forEach(entry => {

&#x20;               if (entry.isIntersecting) {

&#x20;                   entry.target.style.opacity = '1';

&#x20;                   entry.target.style.transform = 'translateY(0)';

&#x20;               }

&#x20;           });

&#x20;       }, observerOptions);



&#x20;       document.querySelectorAll('.filter-section, .associations-section').forEach(el => {

&#x20;           el.style.opacity = '0';

&#x20;           el.style.transform = 'translateY(20px)';

&#x20;           el.style.transition = 'all 0.6s ease';

&#x20;           observer.observe(el);

&#x20;       });



&#x20;       // Fix map resize on scroll

&#x20;       window.addEventListener('resize', () => {

&#x20;           map.invalidateSize();

&#x20;       });



&#x20;       // Ensure map renders correctly

&#x20;       setTimeout(() => {

&#x20;           map.invalidateSize();

&#x20;       }, 300);

&#x20;   </script>

</body>

</html>





