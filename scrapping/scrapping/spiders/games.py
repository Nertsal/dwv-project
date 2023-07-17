import scrapy


class GamesSpider(scrapy.Spider):
    name = "games"
    allowed_domains = ["en.wikipedia.org"]
    start_urls = [
        "https://en.wikipedia.org/wiki/List_of_PC_games_(A)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(B)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(C)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(D)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(E)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(F)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(G)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(H)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(I)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(J)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(K)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(L)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(M)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(N)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(O)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(P)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(Q)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(R)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(S)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(T)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(U)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(V)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(W)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(X)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(Y)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(Z)",
        "https://en.wikipedia.org/wiki/List_of_PC_games_(Numerical)",
    ]

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
