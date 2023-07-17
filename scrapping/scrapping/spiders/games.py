import scrapy


class GamesSpider(scrapy.Spider):
    name = "games"
    allowed_domains = ["en.wikipedia.org"]
    start_urls = ["https://en.wikipedia.org/wiki/List_of_PC_games_(A)"]

    def parse(self, response):
        for row in response.xpath("//table[@class='wikitable sortable']/tbody/tr"):
            items = row.xpath("td");
            if len(items) == 6:
                yield {
                    "name": extract_text(items[0]),
                    "developer": extract_text(items[1]),
                    "publisher": extract_text(items[2]),
                    "genres": extract_text(items[3]),
                    "operating_systems": extract_text(items[4]),
                    "release_date": extract_text(items[5]),
                }

def extract_text(response) -> str:
    result = ""
    for s in response.xpath(".//text()").extract():
        result += s
    return result
