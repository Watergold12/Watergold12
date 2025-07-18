import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Screen Settings
WIDTH, HEIGHT = 600, 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Catch the Falling Apple")

# Sprite size
block_size = 40
box_size = 60

# Sound Effects
catch_sound = pygame.mixer.Sound("win.wav")
miss_sound = pygame.mixer.Sound("miss.wav")
game_over_sound = pygame.mixer.Sound("lose.wav")  

# Sprites of the game
apple_image = pygame.image.load("apple.png").convert_alpha()
apple_image = pygame.transform.scale(apple_image, (block_size, block_size))
apple_image_2 = pygame.image.load("apple_screen.png").convert_alpha()
apple_image_2 = pygame.transform.scale(apple_image_2, (125, 125))
box_image = pygame.image.load("crate.png").convert_alpha()
box_image = pygame.transform.scale(box_image, (box_size, box_size))
background_image = pygame.image.load("background.png").convert()
background_image = pygame.transform.scale(background_image, (WIDTH, HEIGHT))
title_image = pygame.image.load("pixil-frame-0 (2).png").convert_alpha()
title_image = pygame.transform.scale(title_image, (400, 400))
press_enter_image = pygame.image.load("pixil-frame-0 (3).png").convert_alpha()
press_enter_image = pygame.transform.scale(press_enter_image, (150, 150))
game_over_image = pygame.image.load("gameover.png").convert_alpha()
game_over_image = pygame.transform.scale(game_over_image, (WIDTH // 2, HEIGHT // 2))
press_space_image = pygame.image.load("press_space.png").convert_alpha()
press_space_image = pygame.transform.scale(press_space_image, (200, 200))

pygame.mixer.music.load("best-game-console-301284.wav")
pygame.mixer.music.play(-1)  # -1 means loop forever

BLACK = (0, 0, 0)

# Player Settings
player_size = 60
player_x = WIDTH // 2
player_y = HEIGHT - player_size
player_speed = 8

# Block Settings
block_x = random.randint(0, WIDTH - block_size)
block_y = -block_size
block_speed = 4

# Score, Lives, Misses
score = 0
lives = 3
miss_count = 0
font = pygame.font.SysFont("Arial", 24)
clock = pygame.time.Clock()

def show_start_screen():
    apple_image_2_y = -100
    apple_image_2_x = WIDTH // 2
    apple_image_2_target_y = HEIGHT // 2 - 60
    falling = True

    while True:
        screen.blit(background_image, (0, 0))
        screen.blit(title_image, (WIDTH // 2 - title_image.get_width() // 2, HEIGHT // 2 - 150))
        screen.blit(press_enter_image, (WIDTH // 2 - press_enter_image.get_width() // 2, HEIGHT // 1.5))

        if falling:
            screen.blit(apple_image_2, (apple_image_2_x, apple_image_2_y))
            apple_image_2_y += 8
            if apple_image_2_y >= apple_image_2_target_y:
                apple_image_2_y = apple_image_2_target_y
                falling = False
        else:
            screen.blit(apple_image_2, (apple_image_2_x, apple_image_2_y))

        pygame.display.flip()
        clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN and not falling:
                return

def fade_out_start_to_game(duration=1000):
    fade_surface = pygame.Surface((WIDTH, HEIGHT))
    fade_surface.fill((0, 0, 0))
    for alpha in range(0, 256, 5):
        fade_surface.set_alpha(alpha)
        screen.blit(background_image, (0, 0))
        screen.blit(title_image, (WIDTH // 2 - title_image.get_width() // 2, HEIGHT // 2 - 150))
        screen.blit(press_enter_image, (WIDTH // 2 - press_enter_image.get_width() // 2, HEIGHT // 2))
        screen.blit(fade_surface, (0, 0))
        pygame.display.update()
        pygame.time.delay(duration // 51)

def show_game_over_screen():
    pygame.mixer.music.stop()
    game_over_sound.play()
    while True:
        screen.blit(game_over_image, (150, 100))
        screen.blit(press_space_image, (WIDTH // 2 - press_space_image.get_width() // 2, HEIGHT - 150))
        pygame.display.flip()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                return

def reset_game():
    global player_x, block_x, block_y, block_speed, score, lives, miss_count
    player_x = WIDTH // 2
    block_x = random.randint(0, WIDTH - block_size)
    block_y = -block_size
    block_speed = 4
    score = 0
    lives = 3
    miss_count = 0
    pygame.mixer.music.play(-1)

while True:
    show_start_screen()
    fade_out_start_to_game()
    reset_game()

    running = True
    while running:
        clock.tick(60)
        screen.blit(background_image, (0, 0))

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

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
                show_game_over_screen()
                break

        elif player_rect.colliderect(block_rect):
            score += 1
            catch_sound.play()
            block_y = -block_size
            block_x = random.randint(0, WIDTH - block_size)
            block_speed += 0.2

        screen.blit(box_image, player_rect.topleft)
        screen.blit(apple_image, block_rect.topleft)

        score_text = font.render(f"Score: {score}", True, BLACK)
        lives_text = font.render(f"Lives: {lives}", True, BLACK)
        misses_text = font.render(f"Misses: {miss_count}/3", True, BLACK)

        screen.blit(score_text, (10, 10))
        screen.blit(lives_text, (10, 40))
        screen.blit(misses_text, (10, 70))

        pygame.display.flip()
