import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Sound Effects
catch_sound = pygame.mixer.Sound("win.wav") # Paste the location before the filename
miss_sound = pygame.mixer.Sound("miss.wav") # Paste the location before the filename

# Screen Settings
WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Catch the Falling Block")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
PLAYER_COLOR = (70, 130, 180)
BLOCK_COLOR = (255, 165, 0)

# Player Settings
player_size = 60
player_x = WIDTH // 2
player_y = HEIGHT - player_size
player_speed = 8

# Block Settings
block_size = 40
block_x = random.randint(0, WIDTH - block_size)
block_y = -block_size
block_speed = 4

# Score, Lives, Misses
score = 0
lives = 3
miss_count = 0
font = pygame.font.SysFont("Arial", 24)

clock = pygame.time.Clock()

# Game loop
running = True
while running:
    clock.tick(60)
    screen.fill(WHITE)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and player_x > 0:
        player_x -= player_speed
    if keys[pygame.K_RIGHT] and player_x < WIDTH - player_size:
        player_x += player_speed

    block_y += block_speed
    player_rect = pygame.Rect(player_x, player_y, player_size, player_size)
    block_rect = pygame.Rect(block_x, block_y, block_size, block_size)

    if block_y > HEIGHT:
        lives -= 1
        miss_count += 1
        miss_sound.play()
        block_y = -block_size
        block_x = random.randint(0, WIDTH - block_size)

        if miss_count >= 3:
            print("Game Over! You missed 3 times.")
            print("Final Score:", score)
            pygame.quit()
            sys.exit()

    elif player_rect.colliderect(block_rect):
        score += 1
        catch_sound.play()
        block_y = -block_size
        block_x = random.randint(0, WIDTH - block_size)
        block_speed += 0.2

    # Draw elements
    pygame.draw.rect(screen, PLAYER_COLOR, player_rect)
    pygame.draw.rect(screen, BLOCK_COLOR, block_rect)

    score_text = font.render(f"Score: {score}", True, BLACK)
    lives_text = font.render(f"Lives: {lives}", True, BLACK)
    misses_text = font.render(f"Misses: {miss_count}/3", True, BLACK)

    screen.blit(score_text, (10, 10))
    screen.blit(lives_text, (10, 40))
    screen.blit(misses_text, (10, 70))

    pygame.display.flip()
