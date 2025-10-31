# --- ЭТАП 1: Сборка React-приложения (Build Stage) ---
FROM node:18-alpine AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код фронтенда
COPY . .

# Собираем приложение в статические файлы
RUN npm run build

# --- ЭТАП 2: Настройка веб-сервера (Final Stage) ---
FROM nginx:1.25-alpine

# Копируем собранные файлы из предыдущего этапа в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем ваш файл конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 для входящих HTTP-запросов
EXPOSE 80

# Команда для запуска Nginx
CMD ["nginx", "-g", "daemon off;"]