# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class LanguageItem(scrapy.Item):
    name = scrapy.Field()
    paradigms = scrapy.Field()
    appeared = scrapy.Field()
    influenced_by = scrapy.Field()
    influenced = scrapy.Field()
