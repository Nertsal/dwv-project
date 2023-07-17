import scrapy

from datetime import datetime


class LanguagesSpider(scrapy.Spider):
    name = "languages"
    allowed_domains = ["en.wikipedia.org"]
    # start_urls = ["https://en.wikipedia.org/wiki/Rust_(programming_language)"]
    # start_urls = ["https://en.wikipedia.org/wiki/List_of_programming_languages"]
    start_urls = ["https://en.wikipedia.org/wiki/List_of_programming_languages_by_type"]

    def parse(self, response):
        for item in response.xpath("//div[@class='div-col']/ul/li/a"):
            yield {
                "name": item.xpath("text()")[0].extract(),
                "link": item.xpath("@href")[0].extract(),
            }

    def parse_language(self, response):
        table = response.xpath("//table[@class='infobox vevent']")[0]
        name = table.xpath(".//caption/text()")[0].extract()
        paradigms = []
        appeared = None
        influenced_by = []
        influenced = []
        wait_for_inf_by = False
        wait_for_inf = False
        for row in table.xpath("tbody/tr"):
            headers = row.xpath("th//text()").extract()
            items = row.xpath("td")
            if wait_for_inf_by:
                influenced_by = parse_list(items)
                wait_for_inf_by = False
            if wait_for_inf:
                influenced = parse_list(items)
                wait_for_inf = False
            if len(headers) == 1:
                header = headers[0]
                match header:
                    case "Paradigms":
                        paradigms = parse_list(items)
                    case "First appeared":
                        appeared = parse_text(items)
                    case "Influenced by":
                        wait_for_inf_by = True
                    case "Influenced":
                        wait_for_inf = True
        yield {
            "name" : name,
            "paradigms" : paradigms,
            "appeared" : appeared,
            "influenced_by" : influenced_by,
            "influenced" : influenced,
        }

def parse_text(items):
    if len(items) != 1:
        return None
    return items[0].xpath("text()")[0].extract()

def parse_list(items):
    if len(items) != 1:
        return []
    result = []
    for item in items[0].xpath("ul/li/a"):
        result.append({
            "name": item.xpath("text()")[0].extract(),
            "link": item.xpath("@href")[0].extract(),
        })
    return result

