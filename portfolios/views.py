from django.shortcuts import render

def dark_template1_preview(request):
    return render(request, 'portfolios/dark_template1.html')

def dark_template2_preview(request):
    return render(request, 'portfolios/dark_template2.html')

def light_template1_preview(request):
    return render(request, 'portfolios/light_template1.html')

def light_template2_preview(request):
    return render(request, 'portfolios/light_template2.html')
