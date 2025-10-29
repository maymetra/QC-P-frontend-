# --- ЭТАП СБОРКИ (BUILD STAGE) ---
FROM node:18-alpine AS build
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Копируем УЖЕ ГОТОВЫЕ зависимости
COPY node_modules ./node_modules

# Копируем остальной код
COPY . .

# Собираем приложение
RUN npm run build

# --- ЭТАП РАБОТЫ (FINAL STAGE) ---
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]